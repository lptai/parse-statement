import fs from 'fs';
import pdfParse from 'pdf-parse';
import { PdfExtractorInterface } from '../../interface';
import { parseTransactions } from './parseTransaction';

export class VcbExtractor implements PdfExtractorInterface {
  async load(filePath: string): Promise<{
    pageTables: { page: string; rows: string[][] }[];
    numPages: number;
  }> {
    const result = await this.parseVcbStatement(filePath);
    return {
      numPages: 1,
      pageTables: [
        {
          page: result.numPages,
          rows: Object.values(result.data).map((record) =>
            Object.values(record),
          ),
        },
      ],
    };
  }

  // Function to read and parse PDF
private async parseVcbStatement(filePath: string) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Here we split the text into lines and create a JSON object
    const dataLines = data.text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return {
      numPages: data.numpages,
      data: parseTransactions(dataLines),
    };
  } catch (error) {
    console.error('Error reading or parsing the PDF file:', error);
  }
}
}
