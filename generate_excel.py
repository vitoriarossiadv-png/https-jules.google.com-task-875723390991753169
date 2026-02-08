import openpyxl
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.formatting.rule import CellIsRule

def create_excel_template():
    wb = openpyxl.Workbook()

    # Define styles
    header_fill = PatternFill(start_color="36454F", end_color="36454F", fill_type="solid") # Dark Slate
    header_font = Font(color="FFFFFF", bold=True)
    body_font = Font(name="Lato")

    # ---------------------------------------------------------
    # 1. Config Sheet (Hidden)
    # ---------------------------------------------------------
    ws_config = wb.active
    ws_config.title = "Config"
    ws_config['A1'] = "Complexidade"
    ws_config['B1'] = "Dias"

    configs = [
        ("Baixa", 4),
        ("Média", 7),
        ("Alta", 10)
    ]

    for row in configs:
        ws_config.append(row)

    ws_config.sheet_state = 'hidden'

    # ---------------------------------------------------------
    # 2. Entrada (Input Sheet)
    # ---------------------------------------------------------
    ws_entrada = wb.create_sheet("Entrada")

    headers = [
        "ID", "Cliente", "Tipo de Ação", "Complexidade",
        "Data Envio Doc", "Prazo (Dias)", "Prazo Fatal",
        "Status", "Data Protocolo", "Advogado Responsável"
    ]

    ws_entrada.append(headers)

    # Style headers
    for cell in ws_entrada[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")

    # Data Validation: Complexidade
    dv_complexity = DataValidation(type="list", formula1='"Baixa,Média,Alta"', showDropDown=True)
    ws_entrada.add_data_validation(dv_complexity)
    dv_complexity.add("D2:D1000") # Apply to D column

    # Data Validation: Status
    dv_status = DataValidation(type="list", formula1='"Pendente,Em Andamento,Finalizada"', showDropDown=True)
    ws_entrada.add_data_validation(dv_status)
    dv_status.add("H2:H1000") # Apply to H column

    # Formulas for Row 2 (Template)
    # F2: Prazo (Dias) -> VLOOKUP based on Complexidade
    # In Excel/Sheets, we'll use a standard IF or VLOOKUP. Since the Config sheet is hidden,
    # we can use explicit values in the formula for portability or refer to the hidden sheet.
    # Let's use IFS for readability in modern Excel/Sheets:
    # =IFS(D2="Baixa", 4, D2="Média", 7, D2="Alta", 10)
    # But strictly speaking, VLOOKUP is safer for older versions.
    # We'll use VLOOKUP against the hidden Config sheet.

    for row_idx in range(2, 101): # Pre-fill formulas for 100 rows
        cell_complex = f"D{row_idx}"
        cell_date_doc = f"E{row_idx}"

        # F: Prazo (Dias)
        # =IFERROR(VLOOKUP(D2, Config!A:B, 2, FALSE), 0)
        ws_entrada[f"F{row_idx}"] = f'=IFERROR(VLOOKUP({cell_complex}, Config!A:B, 2, FALSE), 0)'

        # G: Prazo Fatal
        # =WORKDAY(E2, F2)
        # Need to handle empty dates to avoid 1900 dates.
        ws_entrada[f"G{row_idx}"] = f'=IF({cell_date_doc}="", "", WORKDAY({cell_date_doc}, F{row_idx}))'

    # ---------------------------------------------------------
    # 3. Monthly Sheets
    # ---------------------------------------------------------
    months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
              "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    for month in months:
        ws_month = wb.create_sheet(month)
        ws_month.append(headers)
        for cell in ws_month[1]:
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center")

    # ---------------------------------------------------------
    # 4. Dashboard
    # ---------------------------------------------------------
    ws_dash = wb.create_sheet("Dashboard", 0) # Move to first position
    ws_dash.sheet_view.showGridLines = False

    ws_dash['A1'] = "DASHBOARD - GESTÃO DE PROTOCOLOS"
    ws_dash['A1'].font = Font(size=20, bold=True, color="2C3E50")
    ws_dash.merge_cells('A1:E1')

    # Metrics
    ws_dash['A3'] = "Total Iniciais Lançadas"
    ws_dash['B3'] = "Total Finalizadas"
    ws_dash['C3'] = "% Meta Batida"
    ws_dash['D3'] = "Status da Meta"

    # Style Metric Headers
    for cell in ws_dash[3]:
        cell.font = Font(bold=True)
        cell.border = Border(bottom=Side(style='thin'))

    # Formulas for Metrics
    # Total Iniciais = Count(Entrada!A:A) - 1 (Header) + Count(Jan!A:A) - 1...
    # Actually, usually "Entrada" holds pending, and Monthly holds finalized.
    # Total = CountA(Entrada!A:A)-1 + Sum(CountA(Month!A:A)-1 for all months)

    # Let's simplify:
    # A4: Total Pending (Entrada)
    # B4: Total Finalized (All Months)

    # Formula for Total Pending
    ws_dash['A4'] = '=COUNTA(Entrada!A:A)-1'

    # Formula for Total Finalized
    # We need to sum counts from all monthly sheets.
    # =COUNTA(Jan!A:A)-1 + COUNTA(Fev!A:A)-1 ...
    total_finalized_formula = "=" + "+".join([f"(COUNTA({m}!A:A)-1)" for m in months])
    ws_dash['B4'] = total_finalized_formula

    # % Meta Batida = Finalized / (Pending + Finalized)
    # Assuming "Lançadas" means total universe of cases.
    ws_dash['C4'] = '=IF((A4+B4)=0, 0, B4/(A4+B4))'
    ws_dash['C4'].number_format = '0.0%'

    # Status da Meta
    # < 80%: Meta Não Batida
    # >= 80% < 100%: Meta Batida
    # 100%: Supermeta
    ws_dash['D4'] = '=IF(C4=1, "Supermeta", IF(C4>=0.8, "Meta Batida", "Meta Não Batida"))'

    # Conditional Formatting for Status
    # Green for Supermeta, Blue for Batida, Red for Não Batida
    # Excel conditional formatting is complex to inject via openpyxl perfectly for Sheets import,
    # but let's try basic rules.

    red_fill = PatternFill(start_color='FFC7CE', end_color='FFC7CE', fill_type='solid')
    green_fill = PatternFill(start_color='C6EFCE', end_color='C6EFCE', fill_type='solid')
    yellow_fill = PatternFill(start_color='FFEB9C', end_color='FFEB9C', fill_type='solid')

    ws_dash.conditional_formatting.add('D4',
        CellIsRule(operator='equal', formula=['"Meta Não Batida"'], stopIfTrue=True, fill=red_fill))
    ws_dash.conditional_formatting.add('D4',
        CellIsRule(operator='equal', formula=['"Meta Batida"'], stopIfTrue=True, fill=yellow_fill))
    ws_dash.conditional_formatting.add('D4',
        CellIsRule(operator='equal', formula=['"Supermeta"'], stopIfTrue=True, fill=green_fill))

    wb.save("legal_control.xlsx")
    print("Excel file 'legal_control.xlsx' created successfully.")

if __name__ == "__main__":
    create_excel_template()
