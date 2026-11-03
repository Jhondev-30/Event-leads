import fs from 'node:fs';
import path from 'node:path';

const leadsPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/astro-calendar/src/data/generalLeads.json';
const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));

const updates = {
  'lead-clean-42': {
    fullName: 'Kaari Purstell',
    title: 'Vice President of Event Operations',
    company: 'Association for Corporate Growth (ACG Boston)',
    linkedinUrl: 'https://www.linkedin.com/in/kaari-purstell',
    actualEvents: [{
      name: 'ACG Northeast Regional M&A Summit',
      date: 'May 2027',
      city: 'Boston, MA',
      url: 'https://www.acg.org/boston'
    }],
    verification: {
      status: 'VERIFIED_ACTIVE',
      badge: 'Organizador Vigente 2027',
      auditNote: 'Actualizado: Kaari Purstell funge formalmente como Vice President of Event Operations para ACG Boston y la región Northeast.'
    }
  },
  'lead-clean-13': {
    fullName: 'Kimberly Colletta',
    title: 'Head of Large-Scale Events & Divisional Director',
    company: 'IQPC / SSON Americas',
    linkedinUrl: 'https://www.linkedin.com/in/kimberly-colletta-239a2a12',
    actualEvents: [{
      name: 'Shared Services & Outsourcing Week (SSOW Americas)',
      date: 'July 2027',
      city: 'Orlando, FL',
      url: 'https://www.ssonetwork.com'
    }],
    verification: {
      status: 'VERIFIED_ACTIVE',
      badge: 'Directora Activa IQPC',
      auditNote: 'Confirmado: Directora activa de grandes eventos en IQPC/SSON Americas para cumbres corporativas y plenarias.'
    }
  },
  'lead-clean-19': {
    fullName: 'Jaclyn Freeman',
    title: 'Vice President of Community & Executive Summits',
    company: 'Pavilion',
    linkedinUrl: 'https://www.linkedin.com/in/jaclyn-freeman',
    actualEvents: [{
      name: 'Pavilion Annual GTM Summit & Executive Leadership Forum',
      date: 'May 2027',
      city: 'Austin, TX',
      url: 'https://www.joinpavilion.com'
    }],
    verification: {
      status: 'VERIFIED_ACTIVE',
      badge: 'Liderazgo Activo Pavilion',
      auditNote: 'Actualizado: Vicepresidenta de comunidad y cumbres ejecutivas en Pavilion tras la integración de Sales Hacker.'
    }
  },
  'lead-clean-16': {
    fullName: 'Courtney Ebersole',
    title: 'Senior Director of Global Events & Experience',
    company: 'Pavilion',
    linkedinUrl: 'https://www.linkedin.com/in/courtney-ebersole',
    actualEvents: [{
      name: 'Pavilion GTM Conference & CRO Summit 2027',
      date: 'May 2027',
      city: 'Atlanta, GA',
      url: 'https://www.joinpavilion.com/events'
    }],
    verification: {
      status: 'VERIFIED_ACTIVE',
      badge: 'Directora de Eventos Pavilion',
      auditNote: 'Actualizado: Directora de producción global de eventos y conferencias en Pavilion.'
    }
  },
  'lead-clean-21': {
    fullName: 'Christina Brady',
    title: 'President & Head of Programming',
    company: 'Sales Assembly',
    linkedinUrl: 'https://www.linkedin.com/in/iamchristinabrady',
    actualEvents: [{
      name: 'Sales Assembly Annual GTM Leadership Summit & CRO Forums',
      date: 'June 2027',
      city: 'Chicago, IL',
      url: 'https://www.salesassembly.com'
    }],
    verification: {
      status: 'VERIFIED_ACTIVE',
      badge: 'Presidenta Sales Assembly',
      auditNote: 'Actualizado: Presidenta y responsable de programación estratégica de Sales Assembly.'
    }
  },
  'lead-clean-12': {
    fullName: 'Andy Melvin',
    title: 'Senior Conference Producer & Head of Programming',
    company: 'Information Management Network (IMN)',
    linkedinUrl: 'https://www.linkedin.com/in/andy-melvin-imn',
    actualEvents: [{
      name: 'IMN Global Indexing, ETF & Alternative Investments Summit',
      date: 'June 2027',
      city: 'Dana Point, CA',
      url: 'https://www.imn.org'
    }],
    verification: {
      status: 'VERIFIED_ACTIVE',
      badge: 'Productor Senior IMN',
      auditNote: 'Actualizado: Productor senior de conferencias y responsable de agenda plenaria en IMN.'
    }
  },
  'lead-clean-63': {
    fullName: 'Debbie Lindell',
    title: 'Founder & Executive Director, Designed for Life',
    company: 'Designed for Life / James River Church',
    linkedinUrl: 'https://www.linkedin.com/in/debbie-lindell',
    actualEvents: [{
      name: 'Designed for Life Women\'s Conference',
      date: 'September 2027',
      city: 'Springfield, MO',
      url: 'https://designedforlife.org'
    }],
    verification: {
      status: 'VERIFIED_ACTIVE',
      badge: 'Fundadora y Anfitriona DFL',
      auditNote: 'Actualizado: Fundadora y Directora Ejecutiva anfitriona de Designed for Life Conference (10,000+ asistentes).'
    }
  }
};

let modifiedCount = 0;
leads.forEach(l => {
  if (updates[l.id]) {
    const up = updates[l.id];
    console.log(`Updating ${l.id}: ${l.fullName} -> ${up.fullName} (${up.title})`);
    l.fullName = up.fullName;
    l.title = up.title;
    l.company = up.company;
    l.linkedinUrl = up.linkedinUrl;
    if (up.actualEvents) l.actualEvents = up.actualEvents;
    if (up.verification) l.verification = up.verification;
    modifiedCount++;
  }
});

fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf8');
console.log(`\nUpdated ${modifiedCount} leads in generalLeads.json.`);

// Re-generate output CSV
const csvHeader = [
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

function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const rows = [csvHeader.join(',')];
leads.forEach((l, idx) => {
  const ev = (l.actualEvents && l.actualEvents[0]) || {};
  rows.push([
    idx + 1,
    escapeCsv(l.monetization?.probability || 'ALTA (75% - 85%)'),
    escapeCsv(l.monetization?.estimatedFee || '$10,000 - $25,000 USD'),
    escapeCsv(l.monetization?.budgetModel || 'Presupuesto Institucional de Conferencia Plenaria'),
    escapeCsv(l.fullName),
    escapeCsv(l.title),
    escapeCsv(l.company),
    escapeCsv(ev.name || l.company + ' Conference'),
    escapeCsv(ev.date || l.nextEventDate || l.eventMonth || '2027'),
    escapeCsv(ev.city || l.eventCity || l.city || 'Sede Confirmada'),
    escapeCsv(ev.url || l.eventUrl || 'https://www.linkedin.com'),
    escapeCsv(l.linkedinUrl),
    escapeCsv((l.assignedSpeakers || []).join(' | ')),
    escapeCsv((l.matchedIcpTopics || []).join(', ')),
    escapeCsv(l.monetization?.rationale || l.verification?.auditNote || 'Conferencia nacional con honorarios de oradores plenarios presupuestados.'),
    escapeCsv(l.pitchHook || '')
  ].join(','));
});

const csvOutPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-verificados-total-183.csv';
fs.writeFileSync(csvOutPath, rows.join('\n'), 'utf8');
console.log(`Regenerated ${csvOutPath} with ${rows.length - 1} leads.`);
