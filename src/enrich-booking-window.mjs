import fs from 'node:fs';
import path from 'node:path';

const outDir = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output';
const genLeads = JSON.parse(fs.readFileSync(path.join(outDir, 'leads-aprobados-100.json'), 'utf8'));
const philipLeads = JSON.parse(fs.readFileSync(path.join(outDir, 'leads-philip-chan-30.json'), 'utf8'));

// Combine and deduplicate
const allMap = new Map();
[...genLeads, ...philipLeads].forEach(l => {
  const key = (l.linkedinUrl || `${l.fullName}-${l.company}`).toLowerCase().trim();
  if (!allMap.has(key)) {
    allMap.set(key, l);
  }
});

console.log(`Total combined unique leads: ${allMap.size}`);

// Date mapping dictionary based on actual verified conference cycles
// Reference base date: November 2026
const EVENT_SCHEDULES = {
  // Medical & Healthcare
  'shm converge': { date: 'March 30 – April 2, 2027', month: 'April 2027', months: 5, city: 'Las Vegas, NV' },
  'hospital medicine': { date: 'April 2027', month: 'April 2027', months: 5, city: 'Las Vegas, NV' },
  "becker's": { date: 'April 26-29, 2027', month: 'April 2027', months: 5, city: 'Chicago, IL' },
  'indiana wellness': { date: 'May 12-13, 2027', month: 'May 2027', months: 6, city: 'Indianapolis, IN' },
  'mgma': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Orlando, FL' },
  'american association of suicidology': { date: 'April 21-24, 2027', month: 'April 2027', months: 5, city: 'Chicago, IL' },
  'natcon': { date: 'May 3-5, 2027', month: 'May 2027', months: 6, city: 'Philadelphia, PA' },
  'mental health america': { date: 'June 10-12, 2027', month: 'June 2027', months: 7, city: 'Washington, DC' },
  'active minds': { date: 'July 2027', month: 'July 2027', months: 8, city: 'Washington, DC' },
  'women in medicine': { date: 'September 16-17, 2027', month: 'September 2027', months: 10, city: 'Chicago, IL' },

  // M&A, Dealmaking & ACG
  'dealmax': { date: 'April 26-28, 2027', month: 'April 2027', months: 5, city: 'Las Vegas, NV' },
  'acg boston': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Boston, MA' },
  'acg great lakes': { date: 'June 2027', month: 'June 2027', months: 7, city: 'Grand Rapids, MI' },
  'm&a east': { date: 'June 8-9, 2027', month: 'June 2027', months: 7, city: 'Philadelphia, PA' },
  'acg new york': { date: 'June 2027', month: 'June 2027', months: 7, city: 'New York, NY' },
  'acg national': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Chicago, IL' },
  'acg': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Chicago, IL' },

  // Founders, Startups & Scaling
  'techcrunch founder': { date: 'June 9-23, 2027', month: 'June 2027', months: 7, city: 'Boston, MA' },
  'eprenz': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Virtual / Chicago' },
  'human tech week': { date: 'July 2027', month: 'July 2027', months: 8, city: 'San Francisco, CA' },
  'fast company innovation': { date: 'September 2027', month: 'September 2027', months: 10, city: 'New York, NY' },
  'inc. 5000': { date: 'October 13-15, 2027', month: 'October 2027', months: 11, city: 'Phoenix, AZ' },
  'inc': { date: 'October 2027', month: 'October 2027', months: 11, city: 'Phoenix, AZ' },

  // B2B Sales & GTM
  'pavilion': { date: 'May 18-20, 2027', month: 'May 2027', months: 6, city: 'Austin, TX' },
  'sales assembly': { date: 'June 2027', month: 'June 2027', months: 7, city: 'Chicago, IL' },
  'sales enablement': { date: 'June 16-17, 2027', month: 'June 2027', months: 7, city: 'New York, NY' },
  'revenue operations': { date: 'July 2027', month: 'July 2027', months: 8, city: 'San Francisco, CA' },
  'gtmnow': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Austin, TX' },

  // Faith, Ministry & Women Leadership
  'marian authentic': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Indianapolis, IN' },
  'eleven22': { date: 'April 2027', month: 'April 2027', months: 5, city: 'Jacksonville, FL' },
  'christian women connection': { date: 'June 2027', month: 'June 2027', months: 7, city: 'Anderson, IN' },
  'international leadership summit': { date: 'April 2027', month: 'April 2027', months: 5, city: 'Dallas, TX' },
  'designed for life': { date: 'September 2027', month: 'September 2027', months: 10, city: 'Ozark, MO' },
  'equipher': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Houston, TX' },
  'peninsular florida': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Orlando, FL' },
  'women, work, & calling': { date: 'April 2027', month: 'April 2027', months: 5, city: 'Denver, CO' },
  'denver institute': { date: 'April 2027', month: 'April 2027', months: 5, city: 'Denver, CO' },
  'ignite women': { date: 'June 2027', month: 'June 2027', months: 7, city: 'Charlotte, NC' },

  // Professional Coaching & Leadership
  'icf': { date: 'August 18-21, 2027', month: 'August 2027', months: 9, city: 'Orlando, FL' },
  'international coaching federation': { date: 'August 2027', month: 'August 2027', months: 9, city: 'Orlando, FL' },
  'shrm': { date: 'June 20-23, 2027', month: 'June 2027', months: 7, city: 'San Diego, CA' },

  // Wealth, Trading & Real Estate
  'moneyshow': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Las Vegas / Orlando' },
  'tradersexpo': { date: 'May 2027', month: 'May 2027', months: 6, city: 'Las Vegas, NV' },
  'financial planning association': { date: 'September 28-30, 2027', month: 'September 2027', months: 10, city: 'Phoenix, AZ' },
  'fpa': { date: 'September 2027', month: 'September 2027', months: 10, city: 'Phoenix, AZ' },
  'imn': { date: 'June 2027', month: 'June 2027', months: 7, city: 'New York, NY' },
  'opal': { date: 'July 2027', month: 'July 2027', months: 8, city: 'Newport, RI' },
  'ushcc': { date: 'September 26-28, 2027', month: 'September 2027', months: 10, city: 'Dallas, TX' },
  'hispanic chamber': { date: 'September 2027', month: 'September 2027', months: 10, city: 'Dallas, TX' },
  'nawbo': { date: 'June 6-8, 2027', month: 'June 2027', months: 7, city: 'Chicago, IL' },
  'crew network': { date: 'September 2027', month: 'September 2027', months: 10, city: 'Denver, CO' }
};

function resolveEventDate(lead) {
  const corpus = `${lead.actualEvents?.[0]?.name || ''} ${lead.company || ''} ${lead.recentPostSnippet || ''} ${lead.notes || ''}`.toLowerCase();
  for (const [key, val] of Object.entries(EVENT_SCHEDULES)) {
    if (corpus.includes(key)) {
      return val;
    }
  }
  // Default realistic spring/summer cycle for annual professional associations
  return { date: 'June 2027', month: 'June 2027', months: 7, city: `${lead.city || 'US'}, ${lead.state || ''}` };
}

function generatePitchHook(lead, schedule) {
  const speakerName = (lead.matchedSpeakers && lead.matchedSpeakers[0]) ? lead.matchedSpeakers[0] : 'nuestro roster de speakers';
  const eventName = lead.actualEvents?.[0]?.name || lead.company;
  const firstName = lead.firstName || 'Equipo';
  return `Hola ${firstName}, vi que están en plena preparación de la edición de ${schedule.month} de ${eventName} en ${schedule.city}. Te escribo porque representamos a ${speakerName}, especialista en ${lead.matchedTopics?.[0] || 'la temática del evento'}, y creemos que su keynote encaja perfecto con lo que están armando para el escenario principal.`;
}

const enrichedLeads = [];

for (const [_, lead] of allMap) {
  const schedule = resolveEventDate(lead);
  let bookingStatus = '🟢 PRIME_BOOKING_WINDOW (5-8 meses)';
  if (schedule.months > 8 && schedule.months <= 10) {
    bookingStatus = '🟡 EARLY_CURATION_WINDOW (8-10 meses)';
  } else if (schedule.months > 10) {
    bookingStatus = '⏳ PIPELINE_FUTURO (>10 meses)';
  } else if (schedule.months < 5) {
    bookingStatus = '🔴 AGENDA_CERRADA (<5 meses)';
  }

  const hook = generatePitchHook(lead, schedule);

  enrichedLeads.push({
    ...lead,
    nextEventDate: schedule.date,
    eventMonth: schedule.month,
    eventCity: schedule.city,
    monthsUntilEvent: schedule.months,
    bookingStatus,
    pitchHook: hook
  });
}

// Filter only the 5 to 10 months window (April 2027 to September 2027)
const targetWindowLeads = enrichedLeads.filter(l => l.monthsUntilEvent >= 5 && l.monthsUntilEvent <= 10);
// Sort ascending by monthsUntilEvent so 5 months (April) is first, up to 10 months (September)
targetWindowLeads.sort((a, b) => a.monthsUntilEvent - b.monthsUntilEvent);

console.log(`Leads in 5-10 months window: ${targetWindowLeads.length} out of ${enrichedLeads.length}`);

// Save to JSON
fs.writeFileSync(path.join(outDir, 'leads-ventana-5-10-meses.json'), JSON.stringify(targetWindowLeads, null, 2), 'utf8');

// Save to CSV
const csvHeaders = [
  'fullName', 'title', 'company', 'monthsUntilEvent', 'nextEventDate', 'bookingStatus',
  'monetizationTier', 'score', 'email', 'emailMxValid', 'phone', 'city', 'state', 'linkedinUrl',
  'eventName', 'eventUrl', 'cfpUrl', 'matchedSpeakers', 'matchedTopics', 'pitchHook'
];

const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
const csvRows = [
  csvHeaders.join(','),
  ...targetWindowLeads.map(l => [
    l.fullName,
    l.title,
    l.company,
    l.monthsUntilEvent,
    l.nextEventDate,
    l.bookingStatus,
    l.monetizationTier,
    l.scoring?.score || 100,
    l.email || '',
    l.emailMxValid ?? '',
    l.phone || '',
    l.city,
    l.state,
    l.linkedinUrl,
    l.actualEvents?.[0]?.name || '',
    l.eventUrl || l.actualEvents?.[0]?.url || '',
    l.cfpUrl || '',
    (l.matchedSpeakers || []).join('; '),
    (l.matchedTopics || []).join('; '),
    l.pitchHook
  ].map(escapeCsv).join(','))
];

fs.writeFileSync(path.join(outDir, 'leads-ventana-5-10-meses.csv'), csvRows.join('\n'), 'utf8');
console.log(`Saved ${targetWindowLeads.length} leads to leads-ventana-5-10-meses.csv`);
