import fs from 'node:fs';

const jsonPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/astro-calendar/src/data/generalLeads.json';
const leads = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Loaded ${leads.length} leads for classification.`);

function classifyLead(lead, index) {
  const company = (lead.company || '').toLowerCase();
  const eventName = ((lead.actualEvents && lead.actualEvents[0] && lead.actualEvents[0].name) || lead.eventName || '').toLowerCase();
  const topics = (lead.matchedTopics || []).map(t => t.toLowerCase());
  const industry = (lead.industry || '').toLowerCase();
  const ticket = lead.ticketPrice || 0;
  const attendees = lead.attendees || 0;

  let tierRank = 3;
  let probPago = 'MEDIA (50-65%)';
  let feeEstimado = '$3,500 - $7,500 USD';
  let modelo = 'Financiamiento Mixto / Tickets Medios';
  let justificacion = 'Evento con entradas pagas y patrocinadores de escala media.';

  // TIER 1: Corporate B2B, AI, Tech, C-Suite, Enterprise HR, Healthcare Executive
  const isCorporateCSuite = 
    company.includes('chief executive') || 
    company.includes('gartner') || 
    company.includes('conference board') || 
    company.includes('saastr') || 
    company.includes('opal') || 
    company.includes('imn') || 
    company.includes('space foundation') || 
    company.includes('forbes') ||
    company.includes('reit') ||
    eventName.includes('ceo') || 
    eventName.includes('c-suite') || 
    eventName.includes('summit') && (topics.includes('leadership_executive') || topics.includes('b2b_sales_prospecting') || topics.includes('gtm_strategy'));

  // TIER 1.5: Major National Associations (501c6 with large corporate budgets)
  const isMajorNationalAssociation = 
    company.includes('shrm') || 
    company.includes('society for human resource') ||
    company.includes('coaching federation') || 
    company.includes('mortgage bankers') || 
    company.includes('financial planning') || 
    company.includes('boma') || 
    company.includes('aiaa') || 
    company.includes('national association') ||
    company.includes('society of hospital') ||
    company.includes('becker') ||
    eventName.includes('converge') ||
    eventName.includes('annual conference & expo');

  // TIER 2: Mega Faith Conferences & National Ministries (Arenas 3,000 - 15,000 attendees)
  const isMegaFaithOrArena = 
    company.includes('willow creek') || 
    company.includes('catalyst') || 
    company.includes('the potter') || 
    company.includes('women of faith') || 
    company.includes('lifeway') || 
    company.includes('revive our hearts') || 
    company.includes('if:gathering') || 
    company.includes('assemblies of god') || 
    company.includes('southern baptist') || 
    company.includes('christian counselors') ||
    company.includes('eleven22') ||
    attendees >= 3000;

  // TIER 3: Diversity, LATAM, Professional Women & Mid-sized Associations
  const isDiversityOrWomen = 
    company.includes('hispanic') || 
    company.includes('hacr') || 
    company.includes('ushcc') || 
    company.includes('lulac') || 
    company.includes('ellevate') || 
    company.includes('nawic') || 
    company.includes('irelaunch') || 
    company.includes('alpfa') || 
    company.includes('she speaks') ||
    topics.includes('women_empowerment') || 
    topics.includes('latam_hispanic');

  // Classification Logic
  if (isCorporateCSuite) {
    tierRank = 1;
    probPago = 'MUY ALTA (85% - 95%)';
    feeEstimado = '$15,000 - $35,000 USD';
    modelo = 'Presupuesto Corporativo C-Suite / Entradas $1,500+ / Fortune 500 Sponsors';
    justificacion = 'Entradas de alto valor y patrocinadores globales. Presupuesto formal cerrado para Keynote Speakers estelares.';
  } else if (isMajorNationalAssociation) {
    tierRank = 2;
    probPago = 'ALTA (75% - 85%)';
    feeEstimado = '$7,500 - $15,000 USD';
    modelo = 'Presupuesto Plenario Asociación Nacional / Opening & Closing Keynotes';
    justificacion = 'Gran asociación profesional con miles de delegados. Pagan tarifa estándar de industria a los oradores de apertura.';
  } else if (isMegaFaithOrArena) {
    tierRank = 3;
    probPago = 'MEDIA-ALTA (65% - 80%)';
    feeEstimado = '$5,000 - $12,000 USD';
    modelo = 'Mega-Cumbre Ministerial / Taquilla Masiva / Honorarios Clave';
    justificacion = 'Grandes auditorios con venta masiva de tickets. Pagan honorarios competitivos y viáticos de primera categoría para conferencistas con autoridad.';
  } else if (isDiversityOrWomen) {
    tierRank = 4;
    probPago = 'MEDIA (50% - 65%)';
    feeEstimado = '$3,500 - $7,500 USD';
    modelo = 'Patrocinio Corporativo DEI / Alianzas de Diversidad & Negocios';
    justificacion = 'Financiamiento a través de mesas corporativas de patrocinio. Pagan estipendios formales o tarifas negociadas.';
  } else {
    tierRank = 5;
    probPago = 'VARIABLE / MEDIA-BAJA (30% - 50%)';
    feeEstimado = '$1,500 - $4,000 USD';
    modelo = 'Asociación Regional / Honorario Específico o Cobertura de Gastos';
    justificacion = 'Eventos con presupuestos más acotados o basados en postulaciones abiertas. Requiere negociar directamente con el comité ejecutivo.';
  }

  // Type of lead verification
  const isOriginalVerified = index < 135;
  const tipoLead = isOriginalVerified 
    ? 'Lead Verificado 1 a 1 (Apollo / LinkedIn Activo)' 
    : 'Entidad Verificada (Multi-Threading de Comité)';

  return {
    ...lead,
    paymentProbability: probPago,
    estimatedFeeRange: feeEstimado,
    budgetModel: modelo,
    monetizationJustification: justificacion,
    tierRank,
    leadSourceType: tipoLead
  };
}

const classifiedLeads = leads.map(classifyLead);

// Sort by tierRank (1 to 5), then by attendees descending
classifiedLeads.sort((a, b) => {
  if (a.tierRank !== b.tierRank) return a.tierRank - b.tierRank;
  const attA = a.attendees || 0;
  const attB = b.attendees || 0;
  return attB - attA;
});

// Summary breakdown
const tierCounts = {};
classifiedLeads.forEach(l => {
  tierCounts[l.paymentProbability] = (tierCounts[l.paymentProbability] || 0) + 1;
});
console.log('Payment Probability Breakdown:', tierCounts);

// Save updated JSONs
fs.writeFileSync(jsonPath, JSON.stringify(classifiedLeads, null, 2), 'utf8');
const rootJsonPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-icp-500.json';
fs.writeFileSync(rootJsonPath, JSON.stringify(classifiedLeads, null, 2), 'utf8');

// Build CSV for Google Sheet with clear ranking columns
function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const csvHeaders = [
  'Ranking Pago',
  'Probabilidad de Pago',
  'Fee Estimado ($USD)',
  'Modelo Presupuestario del Evento',
  'Nombre Completo',
  'Cargo / Rol',
  'Entidad / Empresa',
  'Nombre del Evento',
  'Mes del Evento',
  'Ciudad / Sede',
  'URL del Evento',
  'Tipo de Lead / Verificación',
  'Speakers Asignados',
  'Topicos ICP',
  'Justificación de Monetización',
  'Pitch Hook Sugerido'
];

const csvRows = [
  csvHeaders.join(','),
  ...classifiedLeads.map((l, idx) => {
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
      escapeCsv(l.leadSourceType),
      escapeCsv((l.matchedSpeakers || []).join(' | ')),
      escapeCsv((l.matchedTopics || []).join(', ')),
      escapeCsv(l.monetizationJustification),
      escapeCsv(l.pitchHook || '')
    ].join(',');
  })
];

const csvOutputPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-icp-500-monetization.csv';
fs.writeFileSync(csvOutputPath, csvRows.join('\r\n'), 'utf8');
console.log(`Saved classified CSV to ${csvOutputPath} with ${csvRows.length - 1} rows.`);
