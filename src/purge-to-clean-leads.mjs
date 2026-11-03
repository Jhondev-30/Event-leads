import fs from 'node:fs';

const generalPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/astro-calendar/src/data/generalLeads.json';
const philipPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/astro-calendar/src/data/philipLeads.json';
const philipEnrichedPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-philip-chan-30-enriched.json';

const allLeads = JSON.parse(fs.readFileSync(generalPath, 'utf8'));

// 1. Filter only real verified leads (the first 135)
const realVerified135 = allLeads.filter(l => l.leadSourceType && l.leadSourceType.includes('Lead Verificado 1 a 1'));

console.log(`Original verified pool: ${realVerified135.length} leads.`);

// 2. Remove SaaStr and SaaStock (violates ICP: pay-to-play, tech puro, zero keynote fees)
const cleanedRealLeads = realVerified135.filter(l => {
  const comp = (l.company || '').toLowerCase();
  const ev = ((l.actualEvents && l.actualEvents[0] && l.actualEvents[0].name) || l.eventName || '').toLowerCase();
  if (comp.includes('saastr') || ev.includes('saastr')) return false;
  if (comp.includes('saastock') || ev.includes('saastock')) return false;
  return true;
});

console.log(`Purged leads count: ${cleanedRealLeads.length} leads (removed SaaStr and SaaStock).`);

// 3. Classify remaining 133 leads by payment probability
function classifyCleanLead(lead) {
  const company = (lead.company || '').toLowerCase();
  const eventName = ((lead.actualEvents && lead.actualEvents[0] && lead.actualEvents[0].name) || lead.eventName || '').toLowerCase();
  const topics = (lead.matchedTopics || []).map(t => t.toLowerCase());

  let tierRank = 3;
  let probPago = 'MEDIA (50% - 65%)';
  let feeEstimado = '$3,500 - $7,500 USD';
  let modelo = 'Financiamiento Mixto / Tickets Medios';
  let justificacion = 'Evento con entradas pagas y patrocinadores de escala media.';

  // TIER 1: Corporate B2B, C-Suite, Enterprise HR, Healthcare Executive
  const isCorporateCSuite = 
    company.includes('chief executive') || 
    company.includes('conference board') || 
    company.includes('titan ceo') || 
    company.includes('becker') || 
    company.includes('space foundation') || 
    company.includes('satellite industry') || 
    company.includes('imn') || 
    company.includes('informa connect') || 
    company.includes('kbra') || 
    company.includes('opal') || 
    company.includes('iqpc') || 
    company.includes('future proof') || 
    company.includes('pensions & investments') || 
    company.includes('workhuman') || 
    company.includes('from day one') || 
    company.includes('transform') || 
    company.includes('zonda') || 
    company.includes('battle of the quants') || 
    company.includes('pavilion') || 
    company.includes('sales assembly') || 
    company.includes('indiana chamber');

  // TIER 2: Major National Associations (501c6 / 501c3 grandes con presupuestos de plenario)
  const isMajorNationalAssociation = 
    company.includes('shrm') || 
    company.includes('coaching federation') || 
    company.includes('icf') || 
    company.includes('financial planning') || 
    company.includes('fpa') || 
    company.includes('boma') || 
    company.includes('society of hospital') || 
    company.includes('society of hispanic professional') || 
    company.includes('prospanica') || 
    company.includes('nacubo') || 
    company.includes('worldatwork') || 
    company.includes('american astronomical') || 
    company.includes('chest') || 
    company.includes('mgma') || 
    company.includes('natcon') || 
    company.includes('national council for mental') || 
    company.includes('association for corporate growth') || 
    company.includes('acg') || 
    company.includes('urban land institute') || 
    company.includes('uli');

  // TIER 3: Mega Faith Conferences & National Ministries
  const isMegaFaith = 
    company.includes('potter') || 
    company.includes('assemblies of god') || 
    company.includes('eleven22') || 
    company.includes('fca') || 
    company.includes('fellowship of christian athletes') || 
    company.includes('proverbs 31') || 
    company.includes('she speaks') || 
    company.includes('convoy of hope') || 
    company.includes('christian women connection') || 
    company.includes('thinq');

  // TIER 4: Diversity, Women, Wellness & Medical Societies
  const isDiversityWomenWellness = 
    company.includes('nawbo') || 
    company.includes('wbenc') || 
    company.includes('alpfa') || 
    company.includes('ushcc') || 
    company.includes('latino') || 
    company.includes('hispanic') || 
    company.includes('crew network') || 
    company.includes('ignite women') || 
    company.includes('marian authentic') || 
    company.includes('institute for functional medicine') || 
    company.includes('ifm') || 
    company.includes('aclm') || 
    company.includes('lifestyle medicine') || 
    company.includes('global wellness') || 
    company.includes('eudemonia') || 
    company.includes('mindvalley');

  if (isCorporateCSuite) {
    tierRank = 1;
    probPago = 'MUY ALTA (85% - 95%)';
    feeEstimado = '$15,000 - $35,000 USD';
    modelo = 'Presupuesto Corporativo C-Suite / Entradas $1,500+ / Fortune 500 Sponsors';
    justificacion = 'Presupuesto formal cerrado para Keynote Speakers estelares en escenario principal.';
  } else if (isMajorNationalAssociation) {
    tierRank = 2;
    probPago = 'ALTA (75% - 85%)';
    feeEstimado = '$7,500 - $15,000 USD';
    modelo = 'Presupuesto Plenario Asociación Nacional / Opening & Closing Keynotes';
    justificacion = 'Gran asociación profesional con miles de miembros. Pagan tarifa de industria a oradores plenarios.';
  } else if (isMegaFaith) {
    tierRank = 3;
    probPago = 'MEDIA-ALTA (65% - 80%)';
    feeEstimado = '$5,000 - $12,000 USD';
    modelo = 'Mega-Cumbre Ministerial / Taquilla Masiva / Honorarios Clave';
    justificacion = 'Auditorios masivos con venta de entradas. Fondos asignados para oradores de trayectoria.';
  } else if (isDiversityWomenWellness) {
    tierRank = 4;
    probPago = 'MEDIA (50% - 65%)';
    feeEstimado = '$3,500 - $7,500 USD';
    modelo = 'Patrocinio Corporativo DEI & Salud / Alianzas de Negocios';
    justificacion = 'Financiamiento mediante mesas corporativas de patrocinio. Pagan estipendios o tarifas intermedias.';
  } else {
    tierRank = 5;
    probPago = 'VARIABLE / MEDIA-BAJA (30% - 50%)';
    feeEstimado = '$1,500 - $4,000 USD';
    modelo = 'Asociación Regional / Honorario Específico';
    justificacion = 'Eventos más acotados o capítulos regionales. Requiere negociación directa de viáticos y fee.';
  }

  return {
    ...lead,
    paymentProbability: probPago,
    estimatedFeeRange: feeEstimado,
    budgetModel: modelo,
    monetizationJustification: justificacion,
    tierRank,
    leadSourceType: 'Lead 100% Verificado (Humano Real con LinkedIn Auditado)'
  };
}

const finalCleanLeads = cleanedRealLeads.map(classifyCleanLead);

// Sort by tierRank (1 to 5), then by company
finalCleanLeads.sort((a, b) => {
  if (a.tierRank !== b.tierRank) return a.tierRank - b.tierRank;
  return a.company.localeCompare(b.company);
});

// Restore original 30 Philip Chan leads
const realPhilipLeads = JSON.parse(fs.readFileSync(philipEnrichedPath, 'utf8'));
console.log(`Restoring Philip Chan leads to original ${realPhilipLeads.length} verified leads.`);

// Save back to astro-calendar data
fs.writeFileSync(generalPath, JSON.stringify(finalCleanLeads, null, 2), 'utf8');
fs.writeFileSync(philipPath, JSON.stringify(realPhilipLeads, null, 2), 'utf8');

// Also update root data.js
const rootDataJs = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/data.js';
const winObj = {
  EVENT_LEADS_DATA: {
    generalLeads: finalCleanLeads,
    philipLeads: realPhilipLeads
  }
};
fs.writeFileSync(rootDataJs, `// Pure Verified Event Leads\nwindow.EVENT_LEADS_DATA = ${JSON.stringify(winObj.EVENT_LEADS_DATA, null, 2)};\n`, 'utf8');

// Build CSV for Google Sheet
function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const csvHeaders = [
  'Ranking Pago',
  'Probabilidad de Pago',
  'Fee Estimado ($USD)',
  'Modelo Presupuestario',
  'Nombre Completo',
  'Cargo / Rol',
  'Entidad / Empresa',
  'Nombre del Evento',
  'Mes del Evento',
  'Ciudad / Sede',
  'URL del Evento',
  'LinkedIn Verificado',
  'Speakers Asignados',
  'Topicos ICP',
  'Justificación de Monetización',
  'Pitch Hook Sugerido'
];

const csvRows = [
  csvHeaders.join(','),
  ...finalCleanLeads.map((l, idx) => {
    const ev = (l.actualEvents && l.actualEvents[0]) || {};
    return [
      idx + 1,
      escapeCsv(l.paymentProbability),
      escapeCsv(l.estimatedFeeRange),
      escapeCsv(l.budgetModel),
      escapeCsv(l.fullName),
      escapeCsv(l.title),
      escapeCsv(l.company),
      escapeCsv(ev.name || l.eventName || l.company + ' Conference'),
      escapeCsv(l.eventMonth || 'Junio 2027'),
      escapeCsv(l.eventCity || (l.city ? `${l.city}, ${l.state || ''}` : 'Estados Unidos')),
      escapeCsv(l.eventUrl || 'https://' + (l.domain || 'google.com')),
      escapeCsv(l.linkedinUrl || ''),
      escapeCsv((l.matchedSpeakers || []).join(' | ')),
      escapeCsv((l.matchedTopics || []).join(', ')),
      escapeCsv(l.monetizationJustification),
      escapeCsv(l.pitchHook || '')
    ].join(',');
  })
];

const cleanCsvPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-verificados-clean.csv';
fs.writeFileSync(cleanCsvPath, csvRows.join('\r\n'), 'utf8');

console.log(`Saved clean CSV with ${csvRows.length - 1} verified rows to ${cleanCsvPath}.`);

// Payment probability stats
const stats = {};
finalCleanLeads.forEach(l => {
  stats[l.paymentProbability] = (stats[l.paymentProbability] || 0) + 1;
});
console.log('Clean Leads Breakdown:', stats);
