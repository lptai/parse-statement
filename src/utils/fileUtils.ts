import fs from 'fs';
import path from 'path';

const basePath = path.join(__dirname, `../../data`);

export const getWriteStream = (name: string) => {
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  return fs.createWriteStream(`${basePath}/${name}.json`, { flags: 'a' });
};

export const writeToJsonFile = (data: any[], name: string) => {
  const jsonContent = JSON.stringify(data);
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  fs.writeFileSync(`${basePath}/${name}.json`, jsonContent);
};

export const writeToCsvFile = (
  data: string[][],
  headers: string[],
  name: string,
  separator = '|',
) => {
  let content = data.reduce(
    (acc, item) => acc + item.join(separator) + '\n',
    (headers || []).join(separator) + '\n',
  );

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  fs.writeFileSync(`${basePath}/${name}`, content);

  console.log('Written to CSV file:', name);
};

export const readFromFile = async (fileName: string): Promise<string> => {
  return fs.readFileSync(path.join(basePath, `${fileName}.csv`), 'utf-8');
};

export const getAllFileNamesInFolder = (dirName: string): string[] => {
  return fs.readdirSync(dirName);
};
