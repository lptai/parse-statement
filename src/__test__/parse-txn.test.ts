import { parseTransactions } from '../parse-txn';

const test = [
  'Transactions in detail',
  '10/09/2024',
  '5161.22033',
  '100.000',
  'PARTNER.DIRECT_DEBITS_VCB.MSE.6647',
  '9771412.20240910.66479771412-0981875891_D',
  'ong hanh chia se cung nguoi dan mien Bac',
  'trong dot bao Yagi',
  'Page 1853 of 12028',
  'Telex     : (0805) 411504 VCB - VT',
  'Swift      : BFTV VNVX',
  'Website: www.vietcombank.com.vn',
  'Contact center: 1900.54.54.13',
  'Postal address:',
  '198 TRAN QUANG KHAI AVENUE',
  'HANOI - S.R. VIETNAM',
  'Ngày GD/',
  'TNX Date',
  'Số CT/ Doc No',
  'Số tiền ghi nợ/',
  'Debit',
  'Số tiền ghi có/',
  'Credit',
  'Số dư/',
  'Balance',
  'Nội dung chi tiết/',
  'Transactions in detail',
  '10/09/2024',
  '5388.83470',
  '200.000',
  '020097042209101050522024U9JQ928093.83470',
  '.105034.NGUYEN NGOC BICH ung ho ba con',
  'vung lu',
  '10/09/2024',
  '5161.22470',
  '100.000',
  'PARTNER.DIRECT_DEBITS_VCB.MSE.6648',
  '0235869.20240910.66480235869-0982666480_L',
  'E THI NHU Y chuyen tien qua MoMo',
  '10/09/2024',
  '5161.22474',
  '100.000',
  'PARTNER.DIRECT_DEBITS_VCB.MSE.6648',
  '0235962.20240910.66480235962-0896645571_N',
  'GUYEN BAO TRANG chuyen tien qua',
  'MoMo',
  'Page 1853 of 12028',
];
const data = parseTransactions(test);

console.assert(
  data.length === 4,
  `Should have 4 transactions. Actual: ${data.length}`,
);
console.assert(
  JSON.stringify(data) ===
    JSON.stringify([
      {
        date: '10/09/2024',
        reference: '5161.22033',
        amount: '100.000',
        description:
          ' PARTNER.DIRECT_DEBITS_VCB.MSE.6647 9771412.20240910.66479771412-0981875891_D ong hanh chia se cung nguoi dan mien Bac trong dot bao Yagi',
      },
      {
        date: '10/09/2024',
        reference: '5388.83470',
        amount: '200.000',
        description:
          ' 020097042209101050522024U9JQ928093.83470 .105034.NGUYEN NGOC BICH ung ho ba con vung lu',
      },
      {
        date: '10/09/2024',
        reference: '5161.22470',
        amount: '100.000',
        description:
          ' PARTNER.DIRECT_DEBITS_VCB.MSE.6648 0235869.20240910.66480235869-0982666480_L E THI NHU Y chuyen tien qua MoMo',
      },
      {
        date: '10/09/2024',
        reference: '5161.22474',
        amount: '100.000',
        description:
          ' PARTNER.DIRECT_DEBITS_VCB.MSE.6648 0235962.20240910.66480235962-0896645571_N GUYEN BAO TRANG chuyen tien qua MoMo',
      },
    ]),
  'Should have correct transactions',
);
