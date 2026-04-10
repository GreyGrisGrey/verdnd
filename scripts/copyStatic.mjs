import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distClient = path.join(root, 'dist', 'client');
const assetsSource = path.join(root, 'client', 'assets');
const assetsTarget = path.join(distClient, 'client', 'assets');
const pickerSource = path.join(root, 'toolcool-color-picker.min.js');
const pickerTarget = path.join(distClient, 'toolcool-color-picker.min.js');

fs.mkdirSync(assetsTarget, { recursive: true });
fs.cpSync(assetsSource, assetsTarget, { recursive: true });
fs.copyFileSync(pickerSource, pickerTarget);
