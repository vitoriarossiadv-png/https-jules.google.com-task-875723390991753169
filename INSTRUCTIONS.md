# Manual de Instalação e Uso - Planilha de Gestão Jurídica

Este sistema é dividido em duas partes:
1.  **Código Python (`generate_excel.py`)**: Gera a planilha `.xlsx` no seu computador.
2.  **Google Apps Script (`Code.gs`)**: Automatiza a planilha dentro do Google Sheets.

> **ATENÇÃO**: O erro "SyntaxError: Cannot use import statement outside a module" acontece se você colou o código Python (`import openpyxl...`) dentro do editor do Google Sheets. Siga os passos abaixo com cuidado.

## 1. Gerar e Importar a Planilha (Parte Local)

1.  Execute o código Python `generate_excel.py` no seu computador.
    *   Este código usa a biblioteca `openpyxl` e cria o arquivo `legal_control.xlsx`.
    *   **NÃO** tente rodar este código no Google Sheets.
2.  No Google Sheets (sheets.google.com), crie uma planilha nova.
3.  Vá em **Arquivo > Importar > Upload**.
4.  Selecione o arquivo `legal_control.xlsx` que foi gerado.
5.  Escolha "Substituir planilha" e clique em "Importar dados".

## 2. Configurar a Automação (Parte Google Sheets)

Agora vamos configurar a automação. **Use APENAS o código do arquivo `Code.gs`**.

1.  Na planilha aberta no Google Sheets, vá no menu superior em **Extensões > Apps Script**.
2.  Apague **todo** o código que estiver na janela do editor (geralmente `function myFunction() {...}`).
3.  Copie o conteúdo do arquivo **`Code.gs`** (que começa com `// ESTE CÓDIGO É JAVASCRIPT...`).
4.  Cole no editor do Apps Script.
5.  Clique no ícone de **Salvar** (disquete). Dê um nome ao projeto (ex: "Gestão Protocolos").
6.  Feche a aba do Apps Script e recarregue a página da planilha (F5).

## 3. Como Usar

### Aba "Entrada" (Backlog)
Esta é a aba principal onde novos casos são cadastrados.

1.  **Preencha os dados.**
2.  **Selecione a Complexidade** (Baixa, Média, Alta): O prazo será calculado automaticamente.
3.  **Para Finalizar**:
    *   Preencha a **"Data Protocolo" (Coluna I)**.
    *   Mude o **Status** para `Finalizada`.
    *   O script moverá automaticamente a linha para a aba do mês correspondente (ex: `Jan`, `Fev`) e ordenará por data.

### Dashboard
Mostra os indicadores de desempenho.

*   **Total Protocolos**: Todos os casos (Pendentes + Finalizados).
*   **Finalizadas**: Casos arquivados nas abas mensais.
*   **% Meta Batida**: Percentual de conclusão.
*   **Status**: < 80% (Vermelho), 80-99% (Azul), 100% (Verde).

## 4. Personalização

*   **Prazos**: Edite os dias na aba oculta `Config`.
*   **Feriados**: Adicione feriados na aba `Config` e ajuste a fórmula `WORKDAY`.

---
**Suporte**: Se aparecer um pop-up pedindo autorização na primeira execução, conceda as permissões necessárias.
