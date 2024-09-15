import { PDFDocumentProxy, getDocument } from 'pdfjs-dist';
import { pdf_table_extractor } from './extractor.js';

export class PdfExtractor {
  async load(source: string | Buffer): Promise<{
    pageTables: {
      page: string;
      rows: string[][];
    }[];
    numPages: number;
  }> {
    const pdfdriver: PDFDocumentProxy = await getDocument(source).promise;
    try {
      const result = await pdf_table_extractor(pdfdriver);

      console.log(
        `Extracted ${result.pageTables.length} tables from ${result.numPages} pages`,
      );

      return {
        numPages: result.numPages,
        pageTables: result.pageTables.map((pageTable) => ({
          page: pageTable.page,
          rows: pageTable.tables,
        })),
      };
    } finally {
      pdfdriver.destroy();
    }
  }
}
