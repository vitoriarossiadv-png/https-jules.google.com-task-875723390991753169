/**
 * CÓDIGO GOOGLE APPS SCRIPT (JAVASCRIPT) - NÃO CONFUNDIR COM PYTHON
 *
 * INSTRUÇÕES:
 * 1. Abra sua planilha no Google Sheets.
 * 2. Vá em Extensões > Apps Script.
 * 3. Delete qualquer código que estiver lá e cole este código.
 * 4. Salve o projeto (ícone de disquete).
 * 5. Recarregue a planilha.
 */

// Configuração das colunas (baseado em índice 1)
const COLUNA_STATUS = 8; // Coluna H
const COLUNA_DATA_PROTOCOLO = 9; // Coluna I
const STATUS_FINALIZADO = "Finalizada";
const NOME_ABA_ENTRADA = "Entrada";
const ABAS_MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/**
 * Função executada automaticamente ao editar uma célula.
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;

  // Verifica se a edição foi na aba "Entrada" e na coluna de Status
  if (sheet.getName() === NOME_ABA_ENTRADA && range.getColumn() === COLUNA_STATUS) {
    const status = range.getValue();

    // Se o status mudou para "Finalizada"
    if (status === STATUS_FINALIZADO) {
      processarLinha(sheet, range.getRow());
    }
  }
}

/**
 * Função principal para processar a linha finalizada.
 */
function processarLinha(sheetOrigem, row) {
  const ui = SpreadsheetApp.getUi();

  // Pega os dados da linha inteira
  // Assumindo que temos 10 colunas (A até J)
  const numColunas = 10;
  const linhaDados = sheetOrigem.getRange(row, 1, 1, numColunas).getValues()[0];

  const dataProtocolo = linhaDados[COLUNA_DATA_PROTOCOLO - 1]; // Índice 0-based

  // Validação: Verifica se a data de protocolo está preenchida
  if (!dataProtocolo || !(dataProtocolo instanceof Date)) {
    ui.alert("Data de Protocolo não preenchida!", "Por favor, preencha a 'Data Protocolo' (Coluna I) antes de mudar o status para 'Finalizada'.", ui.ButtonSet.OK);
    // Opcional: Reverter status para 'Pendente' se quiser forçar
    // sheetOrigem.getRange(row, COLUNA_STATUS).setValue("Pendente");
    return;
  }

  // Identifica o mês da data de protocolo (0 = Janeiro, 11 = Dezembro)
  const mesIndex = dataProtocolo.getMonth();
  const nomeAbaDestino = ABAS_MESES[mesIndex];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetDestino = ss.getSheetByName(nomeAbaDestino);

  if (!sheetDestino) {
    ui.alert("Erro", "Aba de destino '" + nomeAbaDestino + "' não encontrada.", ui.ButtonSet.OK);
    return;
  }

  // Copia os dados para a aba de destino
  sheetDestino.appendRow(linhaDados);

  // Formata a linha adicionada (opcional, copia formatação da anterior)
  // Mas aqui vamos apenas deletar a original
  sheetOrigem.deleteRow(row);

  // Ordena a aba de destino pela Data de Protocolo (Coluna I)
  // A linha 1 é cabeçalho, então ordenamos da 2 em diante
  const lastRow = sheetDestino.getLastRow();
  if (lastRow > 1) {
    const rangeSort = sheetDestino.getRange(2, 1, lastRow - 1, numColunas);
    rangeSort.sort({column: COLUNA_DATA_PROTOCOLO, ascending: true});
  }

  // Feedback visual (Toast)
  ss.toast("Protocolo movido para " + nomeAbaDestino, "Sucesso", 3000);
}

/**
 * Adiciona um menu personalizado para executar manualmente se necessário.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Gestão Jurídica')
      .addItem('Processar Linha Selecionada', 'processarLinhaManual')
      .addToUi();
}

function processarLinhaManual() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();

  if (sheet.getName() !== NOME_ABA_ENTRADA) {
    SpreadsheetApp.getUi().alert("Esta função só funciona na aba 'Entrada'.");
    return;
  }

  // Verifica status
  const status = sheet.getRange(row, COLUNA_STATUS).getValue();
  if (status !== STATUS_FINALIZADO) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert("Confirmar", "O status não está como 'Finalizada'. Deseja processar mesmo assim?", ui.ButtonSet.YES_NO);
    if (response == ui.Button.NO) return;
  }

  processarLinha(sheet, row);
}
