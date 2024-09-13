const isFooterStarted = (text) => text.includes('Page ');
const isHeaderEnded = (text) => text.includes('Transactions in detail');
const isValidDate = (dateStr: string) => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  return dateRegex.test(dateStr);
};
const parseAmount = (amountStr: string) => {
  return amountStr.match(/^\d{1,3}(?:([.,]\d{3}){1,3})(?:\.\d{3})?/)[0];
};

export const parseTransactions = (dataLines: string[]) => {
  let isData = false,
    isFirst = true;
  let transaction: any = {};
  const transactions = [];

  for (let i = 0; i < dataLines.length; i++) {
    if (isHeaderEnded(dataLines[i])) {
      isData = true;
      isFirst = true;
    } else if (isFooterStarted(dataLines[i])) {
      isData = false;
      transactions.push({ ...transaction });
      transaction = {};
    } else if (isData) {
      if (!transaction.date || isValidDate(dataLines[i])) {
        !isFirst && transactions.push({ ...transaction });
        isFirst = false;
        transaction = {
          date: dataLines[i],
        };
      } else if (!transaction.reference) {
        transaction.reference = dataLines[i];
      } else if (!transaction.amount) {
        transaction.amount = parseAmount(dataLines[i].split(' ')[0] || '');
        transaction.amountUnit = transaction.amount.replaceAll('.', '');
      } else {
        transaction.description = [
          transaction.description || '',
          dataLines[i],
        ].join(' ');
      }
    }
  }
  return transactions;
};
