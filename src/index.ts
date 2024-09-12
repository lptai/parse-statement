import { writeToFile } from './fileServices';
import { parsePDF } from './parse-pdf';

const filePath = './data/statement.pdf';

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
    console.log(`First 10 transactions:`, transactions.slice(0, 10));
  })
  .catch((error) => {
    console.error('Error parsing transaction data:', error);
  });
