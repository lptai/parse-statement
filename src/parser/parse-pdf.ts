import fs from 'fs';
import pdfParse from 'pdf-parse';
import { parseTransactions } from './parse-txn';

// Function to read and parse PDF
export async function parsePDF(filePath: string) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Here we split the text into lines and create a JSON object
    const dataLines = data.text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return parseTransactions(dataLines);
  } catch (error) {
    console.error('Error reading or parsing the PDF file:', error);
  }
}
