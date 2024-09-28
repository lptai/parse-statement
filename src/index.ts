import { Issuer } from './interface';
import { parsePDF } from './parser/parser';
import { PdfExtractor } from './parser/PdfExtractor';
import { VcbExtractor } from './parser/vcb/VcbExtractor';
import { getAllFileNamesInFolder } from './utils/fileUtils';

const isValidArgibank = (row: string[]) =>
  row.every((cell) => !cell.includes('SỔ PHỤ') && !cell.includes('Ngày  Date'));

const findHeaderRow = (rows: string[][], str: string) =>
  rows.find((row) => row.some((cell) => cell.includes(str)));

const argibank: Issuer = {
  isValidRecord: isValidArgibank,
  headers: (rows) => findHeaderRow(rows, 'Ngày  Date'),
  getParser: () => new PdfExtractor(),
  fileDetector: (fileName) =>
    fileName.includes('argibank') || fileName.includes('1500201113838'),
};

const bidv: Issuer = {
  isValidRecord: (row) =>
    row.every(
      (cell) =>
        !cell.includes(
          'Chứng từ này được in/chuyển đổi trực tiếp từ hệ thống In sao kê tài khoản',
        ) && !cell.includes('Ngày giao dịch'),
    ),
  headers: (rows) => findHeaderRow(rows, 'Ngày giao dịch'),
  getParser: () => new PdfExtractor(),
  fileDetector: (fileName) => fileName.includes('BIDV'),
};

const vietin: Issuer = {
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
  fileDetector: (fileName) => fileName.includes('CT1111'),
};

const vcb: Issuer = {
  isValidRecord: () => true,
  headers: () => ['date', 'amount', 'reference', 'description'],
  getParser: () => new VcbExtractor(),
  fileDetector: (fileName) =>
    fileName.includes('vcb_0011001932418') || fileName.includes('cap nhat'),
};

const vcb_2: Issuer = {
  isValidRecord: (row) => true,
  headers: (rows) => findHeaderRow(rows, 'NGÀY GIAO DỊCH'),
  getParser: () => new PdfExtractor(),
  fileDetector: (fileName) =>
    fileName.includes('Thong tin ung ho qua STK VCB 0011001932418') &&
    !fileName.includes('cap nhat'),
};

const parse = async (fileName: string): Promise<void> => {
  const issuer = [vcb, vcb_2, vietin, bidv, argibank].find((issuer) =>
    issuer.fileDetector(fileName),
  );
  await parsePDF(issuer, fileName);
};

void (async () => {
  const pdfFileNames = getAllFileNamesInFolder('./data_pdf');
  const csvFileNames = getAllFileNamesInFolder('./data');

  const processFileNames = csvFileNames.map((name) =>
    name.replace('.csv', '.pdf'),
  );
  const toProcessFileNames = pdfFileNames.filter(
    (name) => !processFileNames.includes(name),
  );

  await Promise.all(toProcessFileNames.map(parse));
})();
