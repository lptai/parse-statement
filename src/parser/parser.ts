import { Issuer } from '../interface';
import { writeToCsvFile } from '../utils/fileUtils';

// Function to read and parse PDF
export async function parsePDF(issuer: Issuer, filePath: string) {
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
