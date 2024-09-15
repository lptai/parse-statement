import { PdfExtractor } from '../lib/PdfExtractor';
import { writeToCsvFile } from './fileServices';
import { argibank, bidv, Issuer, vcb, vietin } from './issuer/issuser';

// Function to read and parse PDF
export async function parsePDF(issuer: Issuer) {
  for (let index = 0; index < issuer.filePaths.length; index++) {
    const filePath = issuer.filePaths[index];
    try {
      const result = await issuer.getParser().load(`./data_pdf/${filePath}`);

      // normalize the extracted data
      const normalizedRows = result.pageTables.flatMap((pageTable) =>
        pageTable.rows
          .map((row) =>
            row.filter(Boolean).map((cell) => cell.replaceAll('\n', ' ')),
          )
          .filter((row) => row.length > 0),
      );

      const transactions = normalizedRows.filter(issuer.isValidRecord);

      console.log(
        `Extracted ${transactions.length} transactions from ${result.pageTables.length} pages from ${filePath}`,
      );

      const fileName = filePath.replace('.pdf', '.csv');
      writeToCsvFile(transactions, issuer.headers(normalizedRows), fileName);
    } catch (error) {
      console.error('Error reading or parsing the PDF file:', error);
    }
  }
}

void (async () => {
  await Promise.all([vcb, vietin, bidv, argibank].map(parsePDF));
})();
