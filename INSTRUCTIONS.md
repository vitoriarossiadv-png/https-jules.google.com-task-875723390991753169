# Manual de Instalação e Uso - Planilha de Gestão Jurídica

Este documento descreve como configurar a planilha de controle de protocolos no Google Sheets, incluindo a automação para mover processos finalizados para as abas mensais correspondentes.

## 1. Importar a Planilha Template

1.  Acesse o **Google Sheets** (sheets.google.com).
2.  Crie uma nova planilha em branco ou abra uma existente.
3.  Vá em **Arquivo > Importar > Upload**.
4.  Selecione o arquivo `legal_control.xlsx` gerado.
5.  Escolha "Substituir planilha" e clique em "Importar dados".

## 2. Configurar a Automação (Google Apps Script)

Para que os protocolos finalizados sejam movidos automaticamente para a aba do mês correspondente:

1.  Na planilha aberta no Google Sheets, vá no menu superior em **Extensões > Apps Script**.
2.  Uma nova aba será aberta com um editor de código.
3.  Apague qualquer código que esteja lá (geralmente `function myFunction() {...}`).
4.  Copie todo o conteúdo do arquivo `Code.gs` fornecido e cole no editor.
5.  Clique no ícone de **Salvar** (disquete) ou pressione `Ctrl + S`. Dê um nome ao projeto (ex: "Gestão Protocolos").
6.  Feche a aba do Apps Script e recarregue a página da planilha (F5).

## 3. Como Usar

### Aba "Entrada" (Backlog)
Esta é a aba principal onde novos casos são cadastrados.

1.  **Preencha os dados do cliente e processo.**
2.  **Selecione a Complexidade** (Baixa, Média, Alta):
    *   O **Prazo (Dias)** e **Prazo Fatal** serão calculados automaticamente.
    *   *Nota:* Se as fórmulas não funcionarem após a importação, verifique se a aba `Config` foi importada corretamente (ela pode estar oculta).
3.  **Atualize o Status**:
    *   Mantenha como `Pendente` ou `Em Andamento` enquanto trabalha.
    *   Quando finalizar, **preencha a "Data Protocolo" (Coluna I)**.
    *   Mude o **Status** para `Finalizada`.
4.  **Automação**:
    *   Ao mudar o status para `Finalizada` (com a data preenchida), o script moverá automaticamente a linha para a aba do mês correspondente (ex: `Jan`, `Fev`) e ordenará por data.

### Dashboard
A aba `Dashboard` mostra os indicadores de desempenho.

*   **Total Iniciais Lançadas**: Contagem de todos os processos (Entrada + Finalizados).
*   **Total Finalizadas**: Contagem dos processos nas abas mensais.
*   **% Meta Batida**: Percentual de conclusão.
*   **Status da Meta**:
    *   < 80%: Meta Não Batida (Vermelho)
    *   80% - 99%: Meta Batida (Amarelo/Azul)
    *   100%: Supermeta (Verde)

## 4. Personalização

*   **Prazos**: Para alterar os dias de prazo (4, 7, 10), vá na aba oculta `Config` e edite os valores.
*   **Feriados**: A fórmula `WORKDAY` (DiaTrabalho) considera apenas finais de semana. Para considerar feriados, você deve criar uma lista de feriados na aba `Config` e atualizar a fórmula na coluna G.

---
**Suporte Técnica**: Se a automação não rodar, verifique se você deu permissão ao script ao executá-lo pela primeira vez (pode aparecer um pop-up pedindo autorização).
