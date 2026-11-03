import fs from 'node:fs';

const pLeads = JSON.parse(fs.readFileSync('c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-philip-chan-30.json', 'utf8'));
console.log('--- PHILIP CHAN LEADS SAMPLE ---');
pLeads.slice(0, 5).forEach(l => {
  console.log(`- Name: ${l.fullName} | Title: ${l.title} | Company: ${l.company}`);
  console.log(`  LinkedIn: ${l.linkedinUrl}`);
  console.log(`  Event: ${l.actualEvents?.[0]?.name} | CFP: ${l.cfpUrl}`);
  console.log(`  Evidence: ${l.companyResearch?.monetizationEvidence}\n`);
});

const b2 = JSON.parse(fs.readFileSync('c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/batch-cluster-2.json', 'utf8'));
console.log('--- BATCH CLUSTER 2 SAMPLE ---');
b2.slice(0, 3).forEach(l => {
  console.log(`- Name: ${l.fullName} | Title: ${l.title} | Company: ${l.company}`);
  console.log(`  LinkedIn: ${l.linkedinUrl}`);
  console.log(`  Event: ${l.actualEvents?.[0]?.name}`);
  console.log(`  Evidence: ${l.companyResearch?.monetizationEvidence}\n`);
});
