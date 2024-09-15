import { PDFDocumentProxy, getDocument } from 'pdfjs-dist';
import { extractPdf } from '../../lib/extractor';
import { PdfExtractorInterface } from '../interface';

export class PdfExtractor implements PdfExtractorInterface {
  async load(source: string | Buffer): Promise<{
    pageTables: {
      page: string;
      rows: string[][];
    }[];
    numPages: number;
  }> {
    const pdfdriver: PDFDocumentProxy = await getDocument(source).promise;
    try {
      const result = await extractPdf(pdfdriver);

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
