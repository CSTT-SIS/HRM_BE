import * as fs from 'fs';
import * as path from 'path';
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater'); // Use require
const dirGlobal = '/src/UserFile/';
const dirDownloadGlobal = '/src/UserFile/Download';
const rootDir = process.cwd();

export function initialDocxTemplate(templateFile: string): any {
    const content = fs.readFileSync(path.join(rootDir, dirGlobal, templateFile), 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);
    return doc;
}

export function finishSavingDocxTemplate(doc: any, templateFile: string, saveDir: string): string {
    const buf = doc.getZip().generate({
        type: 'nodebuffer',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const dt = new Date();
    const templateFileSplit = templateFile.split('/');
    const fileNameSplitOnly = templateFileSplit[templateFileSplit.length - 1].split('.');
    const filename = fileNameSplitOnly[0] + '_' + dt.getTime() + '.' + fileNameSplitOnly[1];
    const outputPath = path.join(rootDir, dirDownloadGlobal, saveDir, filename);
    fs.writeFileSync(outputPath, buf);
    return outputPath;
}
