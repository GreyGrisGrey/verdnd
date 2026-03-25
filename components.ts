const fs = require('fs');
const compDir = '/components/';
const formDir = '/formats/';
const pageDir = '/pages/';

function constructPage(pageName: string, objects: string[]) {
    const newName = pageName.split('.')[0] + '.html';
    const currFile = fs
        .readFileSync('./' + formDir + pageName, 'utf8')
        .split('\r\n');
    let newOutput = '';
    for (const line of currFile) {
        const args = line.split('\t');
        if (args[0] === 'ADD') {
            newOutput += fs.readFileSync('./' + compDir + args[1], 'utf8');
        } else if (args[0] === 'INSERT') {
            newOutput += args[1];
        } else if (args[0] === 'DIRADD') {
            const toAdd = fs.readdirSync('./' + compDir + args[1]);
            for (const newAdd of toAdd) {
                newOutput += fs.readFileSync(
                    './' + compDir + args[1] + newAdd,
                    'utf8',
                );
            }
        }
    }
    fs.writeFileSync('./' + pageDir + newName, Buffer.from(newOutput, 'utf8'));
}

function constructPages() {
    const toBuild = fs.readdirSync('./' + formDir);
    const buildFrom = fs.readdirSync('./' + compDir);
    for (const f of toBuild) {
        constructPage(f, buildFrom);
    }
}

constructPages();
