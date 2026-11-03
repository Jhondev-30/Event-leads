/**
 * SpeakUp Express — Live Event & CFP Page Verifier + Email Pattern Generator
 * Checks live event URLs for active Call For Speakers (CFP) links, speaker lineup signals,
 * sponsor/budget signals, and verifies DNS MX records for corporate domains.
 */

import dns from 'node:dns/promises';
import { CFP_SPECIFIC_PATTERNS, CFP_TEXT_KEYWORDS, BUDGET_KEYWORDS, containsKeyword } from './scoring.mjs';

/**
 * Inspects a live event or organization website to verify:
 * 1. Whether it accepts external speakers (CFP link or speaker application text)
 * 2. Any dedicated CFP URL (/speak, /cfp, /call-for-speakers, etc.)
 * 3. Budget/Sponsor signals on the page
 */
export async function inspectEventWebpage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { reachable: false, status: res.status, url };
    }

    const html = await res.text();
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract hrefs to detect CFP specific URLs
    const hrefRegex = /href=["']([^"']+)["']/gi;
    const discoveredLinks = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      try {
        const resolved = new URL(match[1], url).href;
        discoveredLinks.push(resolved);
      } catch {
        // ignore malformed href
      }
    }

    const cfpLinks = discoveredLinks.filter(link =>
      CFP_SPECIFIC_PATTERNS.some(rx => rx.test(link))
    );

    const cfpTextHits = CFP_TEXT_KEYWORDS.filter(kw => containsKeyword(textContent, kw));
    const budgetHits = BUDGET_KEYWORDS.filter(kw => containsKeyword(textContent, kw));
    const hasSpeakersSection = /\b(speakers|keynote|lineup|agenda|call for speakers|apply to speak)\b/i.test(textContent);

    return {
      reachable: true,
      status: res.status,
      url,
      hasSpeakersSection,
      acceptsExternalSpeakers: (cfpLinks.length > 0 || cfpTextHits.length > 0) ? 'yes' : (hasSpeakersSection ? 'likely' : 'unknown'),
      cfpUrl: cfpLinks[0] || null,
      cfpTextHits,
      budgetHits
    };
  } catch (err) {
    return {
      reachable: false,
      url,
      error: err.message
    };
  }
}

/**
 * Generates standard corporate email permutations and checks if the domain has valid MX records
 */
export async function enrichCorporateEmail(firstName, lastName, domain) {
  if (!firstName || !lastName || !domain) return { mxValid: false, candidates: [] };
  const cleanDomain = domain.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
  const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const l = lastName.toLowerCase().replace(/[^a-z]/g, '');

  let mxValid = false;
  let mxProvider = null;
  try {
    const records = await dns.resolveMx(cleanDomain);
    if (records && records.length > 0) {
      mxValid = true;
      records.sort((a, b) => a.priority - b.priority);
      mxProvider = records[0].exchange;
    }
  } catch {
    mxValid = false;
  }

  const candidates = [
    `${f}@${cleanDomain}`,
    `${f}.${l}@${cleanDomain}`,
    `${f[0]}${l}@${cleanDomain}`,
    `${f}${l}@${cleanDomain}`,
    `speakers@${cleanDomain}`,
    `events@${cleanDomain}`
  ];

  return {
    domain: cleanDomain,
    mxValid,
    mxProvider,
    primaryCandidate: candidates[0],
    candidates
  };
}
