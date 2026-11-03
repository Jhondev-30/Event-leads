import fs from 'node:fs';
import path from 'node:path';

const outDir = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output';
const files = fs.readdirSync(outDir).filter(f => f.startsWith('batch-cluster-') || f === 'real-run-batch-1.json');

let total = 0;
for (const file of files) {
  const full = path.join(outDir, file);
  try {
    const raw = fs.readFileSync(full, 'utf8');
    const data = JSON.parse(raw);
    console.log(`${file}: ${data.length} leads`);
    total += data.length;
  } catch (e) {
    console.log(`${file}: error parsing: ${e.message}`);
  }
}
console.log(`Total collected: ${total}`);
