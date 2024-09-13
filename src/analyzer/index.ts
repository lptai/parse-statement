const formattedNumber = (number) =>
  String(number).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const formatTransaction = (t) =>
  `${t.date},${formattedNumber(
    t.amountUnit,
  )},${t.reference},${t.description}`;

console.log(formattedNumber); // Output: 135,055,960,736

export const analyze = (data) => {
  console.log('Total transaction: ', formattedNumber(data.length));

  const transaction = data.filter((t) => {
    const isValid = !!Number(t.amountUnit);
    !isValid && console.log(t.reference, t.amountUnit);
    return isValid;
  });

  const totalAmount = transaction.reduce(
    (acc, cur) => acc + Number(cur.amountUnit),
    0,
  );
  console.log('Total valid transaction: ', formattedNumber(transaction.length));
  console.log('Total amount: ', formattedNumber(totalAmount));

  const top10 = transaction
    .sort((a, b) => Number(b.amountUnit) - Number(a.amountUnit))
    .slice(0, 10);

  console.log('Top 10 support: ', top10.map(formatTransaction).join('\n'));

  return top10;
};
