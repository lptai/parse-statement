import { analyze } from '../analyzer';
import { writeToFile } from './fileServices';
import { parsePDF } from './parse-pdf';

const filePath = './thong_tin_ung_ho_qua_tsk_vcb_0011001932418_tu_01_09_den10_09_2024.pdf';

// Define the structure of a transaction
interface Transaction {
  date: string;
  amount: number;
  description: string;
}

// Usage example
parsePDF(filePath)
  .then((transactions) => {
    writeToFile(transactions, 'transactions');
    console.log(`transactions have been written to file`);
    console.log(`Analyze transactions:`, analyze(transactions));
  })
  .catch((error) => {
    console.error('Error parsing transaction data:', error);
  });
