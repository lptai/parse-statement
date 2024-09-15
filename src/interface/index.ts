export interface Issuer {
  filePaths: string[];
  isValidRecord: (row: string[]) => boolean;
  headers: (rows: string[][]) => string[];
  getParser: () => PdfExtractorInterface;
}

export interface PdfExtractorInterface {
  load(filePath: string): Promise<{
    pageTables: {
      page: string;
      rows: string[][];
    }[];
    numPages: number;
  }>;
}
