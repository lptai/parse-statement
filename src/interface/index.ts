export interface Issuer {
  isValidRecord: (row: string[]) => boolean;
  headers: (rows: string[][]) => string[];
  getParser: () => PdfExtractorInterface;
  fileDetector: (fileName: string) => boolean;
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
