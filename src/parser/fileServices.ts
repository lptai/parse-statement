import fs from 'fs';
import path from 'path';

const basePath = path.join(__dirname, `../data`);

export const getWriteStream = (name: string) => {
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  return fs.createWriteStream(`${basePath}/${name}.json`, { flags: 'a' });
};

export const writeToFile = (data: any[], name: string) => {
  const jsonContent = JSON.stringify(data);
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  fs.writeFileSync(`${basePath}/${name}.json`, jsonContent);
};

export const readFromFile = async (fileName: string): Promise<string> => {
  return fs.readFileSync(path.join(basePath, `${fileName}.json`), 'utf-8');
};
