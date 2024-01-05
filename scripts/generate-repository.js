/* eslint-disable @typescript-eslint/no-var-requires */
const { camelize, generateRepo } = require('./function');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Input repository name: `, (name) => {
    name = camelize(name.toLowerCase());
    generateRepo(name);
    console.log(`Done!`);
    readline.close();
});
