import fs from 'node:fs';

const leads = JSON.parse(fs.readFileSync('c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/astro-calendar/src/data/generalLeads.json', 'utf8'));

const names = [
  'Ariel Dorsey', 'Christy Dancause', 'Colin Campbell', 'Julie Dienes', 
  'Kimberly Colletta', 'Dena Levitz', 'Daniel Cline', 'Diane Pastore', 
  'Alison Milgram', 'Katie Hayes', 'Megan McIntire', 'Angela Hudson', 
  'Anusha Harid-Paoletti', 'Troy Clements', 'Kameron Hobbs', 'Annie Glennon'
];

console.log('Searching for ' + names.length + ' names among ' + leads.length + ' leads...\n');

let foundCount = 0;
names.forEach(name => {
  const norm = name.toLowerCase().trim();
  const matches = leads.filter(l => l.fullName && l.fullName.toLowerCase().includes(norm));
  if (matches.length > 0) {
    matches.forEach(f => {
      foundCount++;
      const ev = (f.actualEvents && f.actualEvents[0]) || {};
      console.log('• [ENCONTRADO] ' + f.fullName);
      console.log('   Empresa actual en BD: ' + f.company);
      console.log('   Cargo: ' + f.title);
      console.log('   Evento: ' + (ev.name || f.company + ' Event'));
      console.log('   Mes: ' + (f.nextEventDate || f.eventMonth));
      console.log('   LinkedIn: ' + f.linkedinUrl);
      console.log('   Email: ' + (f.email || 'N/A'));
      console.log('   ID: ' + f.id);
      console.log('----------------------------------------------------');
    });
  } else {
    console.log('• [NO ENCONTRADO EN BD]: ' + name);
  }
});

console.log('\nTotal encontrados: ' + foundCount + ' de ' + names.length);
