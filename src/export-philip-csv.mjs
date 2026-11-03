import fs from 'node:fs';
import path from 'node:path';

const outDir = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output';
const approvedFile = path.join(outDir, 'leads-aprobados.json');
const leads = JSON.parse(fs.readFileSync(approvedFile, 'utf8'));

const csvHeaders = [
  'fullName', 'title', 'company', 'monetizationTier', 'dealType', 'score', 'tier',
  'email', 'emailMxValid', 'phone', 'city', 'state', 'country', 'linkedinUrl',
  'eventName', 'eventUrl', 'cfpUrl', 'matchedSpeakers', 'matchedTopics', 'monetizationEvidence'
];
const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
const csvRows = [
  csvHeaders.join(','),
  ...leads.map(l => [
    l.fullName,
    l.title,
    l.company,
    l.monetizationTier,
    l.dealType,
    l.scoring.score,
    l.scoring.tier,
    l.email || '',
    l.emailMxValid ?? '',
    l.phone || '',
    l.city,
    l.state,
    l.country,
    l.linkedinUrl,
    l.actualEvents?.[0]?.name || '',
    l.eventUrl || l.actualEvents?.[0]?.url || '',
    l.cfpUrl || '',
    (l.matchedSpeakers || []).join('; '),
    (l.matchedTopics || []).join('; '),
    l.companyResearch?.monetizationEvidence || ''
  ].map(escapeCsv).join(','))
];

const csvPath = path.join(outDir, 'leads-philip-chan-30.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
console.log(`Wrote ${leads.length} rows to ${csvPath}`);
