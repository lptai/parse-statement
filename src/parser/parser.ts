export interface PdfParser {
  load(filePath: string): Promise<{
    pageTables: {
      page: string;
      rows: string[][];
    }[];
    numPages: number;
  }>;
}
