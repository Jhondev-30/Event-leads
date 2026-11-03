import fs from 'node:fs';
import path from 'node:path';
import { scoreLead, verifyEmailDomainMX } from './scoring.mjs';

const outDir = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output';
const batchFiles = [
  'batch-cluster-1.json',
  'batch-cluster-2.json',
  'batch-cluster-3.json',
  'batch-cluster-4.json',
  'real-run-batch-1.json'
];

const allLeadsMap = new Map();

for (const file of batchFiles) {
  const fullPath = path.join(outDir, file);
  if (!fs.existsSync(fullPath)) continue;
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const items = JSON.parse(raw);
    for (const lead of items) {
      const key = (lead.linkedinUrl || `${lead.fullName}-${lead.company}`).toLowerCase().trim();
      if (!allLeadsMap.has(key)) {
        allLeadsMap.set(key, lead);
      }
    }
  } catch (err) {
    console.error(`Error loading ${file}: ${err.message}`);
  }
}

console.log(`Total unique leads collected: ${allLeadsMap.size}`);

const approved = [];
const rejected = [];

for (const [_, lead] of allLeadsMap) {
  if (lead.email) {
    lead.emailMxValid = await verifyEmailDomainMX(lead.email);
  }
  const result = scoreLead(lead);
  const enriched = {
    ...lead,
    monetizationTier: result.monetizationTier,
    dealType: result.dealType,
    matchedTopics: result.matchedTopics,
    matchedSpeakers: result.matchedSpeakers,
    scoring: {
      score: result.score,
      tier: result.tier,
      qualified: result.qualified,
      reasons: result.reasons
    }
  };

  if (result.valid && result.qualified) {
    approved.push(enriched);
  } else {
    rejected.push(enriched);
  }
}

// Write approved leads to JSON
const approvedJsonPath = path.join(outDir, 'leads-aprobados-100.json');
fs.writeFileSync(approvedJsonPath, JSON.stringify(approved, null, 2), 'utf8');

// Write approved leads to CSV
const csvHeaders = [
  'fullName', 'title', 'company', 'monetizationTier', 'dealType', 'score', 'tier',
  'email', 'emailMxValid', 'phone', 'city', 'state', 'country', 'linkedinUrl',
  'eventName', 'eventUrl', 'cfpUrl', 'matchedSpeakers', 'matchedTopics', 'monetizationEvidence'
];
const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
const csvRows = [
  csvHeaders.join(','),
  ...approved.map(l => [
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

const approvedCsvPath = path.join(outDir, 'leads-aprobados-100.csv');
fs.writeFileSync(approvedCsvPath, csvRows.join('\n'), 'utf8');

console.log(JSON.stringify({
  totalProcessed: allLeadsMap.size,
  approvedCount: approved.length,
  rejectedCount: rejected.length,
  tierAPaidGigs: approved.filter(a => a.monetizationTier === 'TIER_A_PAID_GIG').length,
  tierBHighExposure: approved.filter(a => a.monetizationTier === 'TIER_B_HIGH_EXPOSURE_CFP').length
}, null, 2));
