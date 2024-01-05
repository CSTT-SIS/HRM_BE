/* eslint-disable @typescript-eslint/no-var-requires */
const { camelize, generateEntity, importToModule } = require('./function');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Input Entity name: `, (name) => {
    readline.question(`Input Table name: `, (table) => {
        name = camelize(name.toLowerCase());
        generateEntity(table.toLowerCase(), name);
        importToModule(name);
        console.log(`Done!`);
        readline.close();
    });
});
