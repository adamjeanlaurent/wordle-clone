import fetch, { Response } from 'node-fetch';
import fs from 'fs';
import path from 'path';

const scrapeWordsFromWeb =  async (): Promise<string[]> => {
    const response: Response = await fetch(' https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json');
    const json: any = await response.json();
    const words: string[] = Object.keys(json);
    return words;
}

export const scrapeWordsFromFileSystem =  (): string[] => {
    const rawData: Buffer = fs.readFileSync(path.join(__dirname, '../words.json'));
    const json: any = JSON.parse(rawData.toString());
    const words: string[] = Object.keys(json);
    return words;
}