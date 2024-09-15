import { PdfExtractor } from '../../lib/PdfExtractor';
import { PdfParser } from '../parser/parser';
import { VcbParser } from '../parser/vcb-parser/vcb-parser';

const vcbFilePaths = [
  'thong_tin_ung_ho_qua_tsk_vcb_0011001932418_tu_01_09_den10_09_2024.pdf',
];

const bidvFilePaths = [
  'Thong tin so tien ung ho qua so tai khoan BIDV 1261122666 tu ngay 01.09 den 12.09.2024.pdf',
];
const vietinFilePaths = [
  'Thong tin so tien ung ho qua so tai khoan VietinBank CT1111 - 111602391111 tu ngay 10 den 12.9.2024.pdf',
];
const argibankFilePaths = [
  'SoPhuUBMTTQHN-1500201113838 tu 01.09-12.09.2024.pdf',
  'mttq_agribank_caobang.pdf'
];

const isValidArgibank = (row: string[]) =>
  row.every((cell) => !cell.includes('SỔ PHỤ') && !cell.includes('Ngày  Date'));

const findHeaderRow = (rows: string[][], str: string) =>
  rows.find((row) => row.some((cell) => cell.includes(str)));
const argibank: Issuer = {
  filePaths: argibankFilePaths,
  isValidRecord: isValidArgibank,
  headers: (rows) => findHeaderRow(rows, 'Ngày  Date'),
  getParser: () => new PdfExtractor(),
};

const bidv: Issuer = {
  filePaths: bidvFilePaths,
  isValidRecord: (row) =>
    row.every(
      (cell) =>
        !cell.includes(
          '351 Chứng từ này được in/chuyển đổi trực tiếp từ hệ thống In sao kê tài khoản',
        ) && !cell.includes('Ngày giao dịch'),
    ),
  headers: (rows) => findHeaderRow(rows, 'Ngày giao dịch'),
  getParser: () => new PdfExtractor(),
};

const vietin: Issuer = {
  filePaths: vietinFilePaths,
  isValidRecord: (row) =>
    row.every(
      (cell) =>
        !cell.includes('STT |Ngày GD |Mô tả giao dịch |Số tiền|Tên đối ứng') &&
        !cell.includes(
          'No |Date Time |Transaction Comment |(Có) Credit|Offset Name',
        ),
    ),
  headers: (rows) => findHeaderRow(rows, 'Ngày GD'),
  getParser: () => new PdfExtractor(),
};

const vcb: Issuer = {
  filePaths: vcbFilePaths,
  isValidRecord: () => true,
  headers: () => ['date', 'amount', 'reference', 'description'],
  getParser: () => new VcbParser(),
};

export interface Issuer {
  filePaths: string[];
  isValidRecord: (row: string[]) => boolean;
  headers: (rows: string[][]) => string[];
  getParser: () => PdfParser;
}

export { argibank, bidv, vietin, vcb };
