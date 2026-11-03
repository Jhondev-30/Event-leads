/**
 * SpeakUp Express — Event Organizer ICP Scoring & Validation Engine (v2.0 Paid-First & High-Exposure Edition)
 * Implements:
 * - 24 ROSTER_TOPICS + Open-Market Commission Mode (for paid events outside the 12-speaker roster)
 * - 3-Tier Monetization Classification: TIER_A_PAID_GIG | TIER_B_HIGH_EXPOSURE_CFP | REJECT_LOW_VALUE_CFP
 * - Strict Pay-to-Play / Sponsorship-Required rejection
 * - Strict v1.12 External Speakers & Stage verification
 * - DNS MX email domain verification with fast timeout
 */

import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';

export const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC','PR'
]);

export const NON_US_CITIES = [
  'beijing', 'shanghai', 'tokyo', 'mumbai', 'delhi', 'bangalore', 'london',
  'paris', 'berlin', 'madrid', 'rome', 'moscow', 'sydney', 'melbourne',
  'toronto', 'vancouver', 'montreal', 'mexico city', 'bogota', 'lima',
  'sao paulo', 'buenos aires', 'santiago', 'dubai', 'singapore', 'hong kong',
  'seoul', 'bangkok', 'jakarta', 'manila', 'cairo', 'lagos', 'johannesburg'
];

export const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'live.com', 'msn.com', 'me.com', 'ymail.com'
]);

// 24 ROSTER TOPICS (v1.13)
export const ROSTER_TOPICS = {
  faith: {
    speakers: ['Dr. Phillip Meade', 'Angie Pichardo', 'Angelie Kapoor', 'Evelena Dawson', 'Jeff Forrester'],
    keywords: [
      'faith', 'christian', 'christianity', 'ministry', 'church leadership', 'pastor',
      'biblical', 'gospel', 'worship', 'if:gathering', 'catalyst conference', 'she speaks',
      'true woman', 'rightnow', 'equip', 'fca', 'fellowship of christian athletes', 'familylife',
      'focus on the family', 'kingdom business', 'faith-based'
    ]
  },
  women_empowerment: {
    speakers: ['Angie Pichardo', 'Angelie Kapoor', 'Evelena Dawson', 'Kelly White', 'Kimberly Aschman'],
    keywords: [
      'women empowerment', 'womens empowerment', 'women summit', 'womens conference',
      'worthy woman', 'listen to her', 'epic women', 'i am woman', 'makers conference',
      'female leadership', 'women leadership', 'affirmed women', 'women of worth'
    ]
  },
  latam_hispanic: {
    speakers: ['Patricio Larrea', 'Philip Chan', 'Sebastián Uzcategui'],
    keywords: [
      'latam', 'latin america', 'hispanic', 'latino', 'latina', 'forbes latam',
      'hispanic business', 'latino leadership', 'hispanic chamber', 'ushcc',
      'l’attitud', 'lattitude', 'emerging markets latam', 'bilingual conference'
    ]
  },
  leadership_executive: {
    speakers: ['Russ Katzman', 'Dr. Phillip Meade', 'Alex Berman'],
    keywords: [
      'executive leadership', 'corporate leadership', 'enterprise transformation',
      'c-suite summit', 'ceo summit', 'leadership summit', 'leadership conference',
      'executive roundtable', 'strategic leadership', 'organizational leadership', 'association leadership'
    ]
  },
  organizational_culture: {
    speakers: ['Dr. Phillip Meade', 'Russ Katzman'],
    keywords: [
      'organizational culture', 'company culture', 'workplace culture', 'employee engagement',
      'culture summit', 'future of work', 'team alignment', 'psychological safety',
      'change management', 'people and culture', 'shrm', 'hr leadership'
    ]
  },
  business_coaching_mindset: {
    speakers: ['Dr. Phillip Meade', 'Russ Katzman', 'Alex Berman', 'Philip Chan'],
    keywords: [
      'business coaching', 'mindset summit', 'entrepreneur mindset', 'growth mindset',
      'personal development conference', 'success summit', 'breakthrough summit'
    ]
  },
  wellness_nutrition: {
    speakers: ['Rachel Scheer'],
    keywords: [
      'wellness', 'nutrition', 'holistic health', 'functional medicine', 'integrative health',
      'integrative healthcare', 'gut health', 'biohacking', 'longevity summit',
      'preventative health', 'health and wellness conference', 'wellness show', 'metabolic health'
    ]
  },
  real_estate: {
    speakers: ['Kimberly Aschman', 'Philip Chan', 'Sebastián Uzcategui'],
    keywords: [
      'women in real estate', 'real estate investing', 'real estate summit',
      'real estate conference', 'commercial real estate women', 'crew network',
      'property investing summit', 'real estate wealth'
    ]
  },
  career_reinvention: {
    speakers: ['Kelly White', 'Angelie Kapoor', 'Kimberly Aschman'],
    keywords: [
      'career reinvention', 'career transition', 'returning to work', 'irelaunch',
      'ellevate', 'second act', 'mid-career', 'career pivot', 'workforce reentry',
      'nawbo', 'wbenc', 'professional reinvention'
    ]
  },
  mental_health_survivor: {
    speakers: ['Angie Pichardo', 'Jeff Forrester'],
    keywords: [
      'mental health', 'suicide prevention', 'suicide survivor', 'near death experience',
      'nde', 'trauma-informed', 'trauma recovery', 'grief recovery', 'resilience conference',
      'behavioral health conference', 'mental wellness summit', 'overcoming adversity'
    ]
  },
  nasa_science_aerospace: {
    speakers: ['Dr. Phillip Meade'],
    keywords: [
      'nasa', 'aerospace', 'astronautical', 'space conference', 'space summit',
      'ieee aerospace', 'american astronautical society', 'aviation leadership',
      'stem leadership', 'space exploration'
    ]
  },
  immigration: {
    speakers: ['Angie Pichardo', 'Angelie Kapoor', 'Dr. Phillip Meade', 'Patricio Larrea'],
    keywords: [
      'immigration', 'immigrant', 'immigrant stories', 'immigrant entrepreneurs',
      'refugee summit', 'migration conference', 'new americans', 'multicultural leadership'
    ]
  },
  young_adults: {
    speakers: ['Jeff Forrester', 'Dr. Phillip Meade', 'Angie Pichardo'],
    keywords: [
      'young adults', 'youth leadership', 'college conference', 'campus ministry',
      'student leadership', 'nextgen summit', 'emerging leaders', 'gen z summit'
    ]
  },
  trading_investing: {
    speakers: ['Sebastián Uzcategui', 'Philip Chan'],
    keywords: [
      'algorithmic trading', 'quantitative trading', 'day trading', 'swing trading',
      'options trading', 'futures trading', 'forex', 'technical analysis', 'market structure',
      'btc', 'eth', 'crypto investing', 'fire movement', 'financial independence',
      'passive income', 'dividend investing', 'value investing', 'index investing',
      'moneyshow', 'traders expo', 'traders summit', 'wealth summit', 'retail traders'
    ]
  },
  burnout_recovery: {
    speakers: ['Sebastián Uzcategui', 'Rachel Scheer', 'Dr. Phillip Meade'],
    keywords: [
      'burnout recovery', 'physician burnout', 'doctor burnout', 'md burnout',
      'surgeon burnout', 'healthcare burnout', 'it professional burnout', 'engineer burnout',
      'physician financial freedom', 'physician side hustle', 'physician entrepreneur',
      'doctor entrepreneur', 'clinician wellness', 'medical wellness'
    ]
  },
  systems_thinking: {
    speakers: ['Sebastián Uzcategui', 'Philip Chan', 'Russ Katzman'],
    keywords: [
      'systems thinking', 'it professionals', 'tech entrepreneur', 'engineer income',
      'software engineer trading', 'data scientist trading', 'machine learning trading',
      'ai trading', 'quant fund', 'quant conference', 'quant summit', 'quantitative finance'
    ]
  },
  business_owners_scalable: {
    speakers: ['Philip Chan', 'Alex Berman', 'Patricio Larrea'],
    keywords: [
      'scalable business', 'business exits', 'mergers and acquisitions', 'founder summit',
      'entrepreneurship summit', 'inc 5000', 'scaling up', 'small business summit',
      'business owners conference', 'multi-exit', 'family business conference'
    ]
  },
  faith_women_combined: {
    speakers: ['Angie Pichardo', 'Angelie Kapoor', 'Evelena Dawson'],
    keywords: [
      'christian women', 'women of faith', 'womens ministry', 'women in ministry',
      'faith and identity', 'christian womens conference', 'proverbs 31', 'if gathering'
    ]
  },
  women_business_branding: {
    speakers: ['Kimberly Aschman', 'Kelly White', 'Angelie Kapoor'],
    keywords: [
      'women in business', 'female founders', 'women entrepreneurs', 'personal branding for women',
      'female executives', 'women business owners', 'she leads', 'women who lead'
    ]
  },
  faith_communities: {
    speakers: ['Dr. Phillip Meade', 'Jeff Forrester', 'Evelena Dawson'],
    keywords: [
      'faith community', 'church network', 'ministry network', 'pastors conference',
      'christian leadership', 'faith and work', 'marketplace ministry'
    ]
  },
  science_research: {
    speakers: ['Dr. Phillip Meade', 'Philip Chan'],
    keywords: [
      'science conference', 'scientific summit', 'research symposium', 'stem conference',
      'innovation in science', 'science leadership'
    ]
  },
  sales_revenue: {
    speakers: ['Alex Berman', 'Philip Chan', 'Sebastián Uzcategui'],
    keywords: [
      'b2b sales', 'sales summit', 'sales conference', 'sales enablement', 'revenue operations',
      'revops', 'sales assembly', 'pavilion', 'saastock sales', 'sales hacker',
      'outbound sales', 'sales leadership', 'cro summit', 'chief revenue officer',
      'go-to-market summit', 'gtm summit', 'sales kickoff'
    ]
  },
  coaching_professional: {
    speakers: ['Dr. Phillip Meade', 'Russ Katzman', 'Alex Berman'],
    keywords: [
      'coach training', 'icf', 'international coaching federation', 'emcc',
      'wbecs', 'executive coach summit', 'coach certification', 'professional coaching',
      'coaching conference', 'coaching summit', 'credentialed coach', 'master coach'
    ]
  },
  high_performance_personal_mastery: {
    speakers: ['Dr. Phillip Meade', 'Russ Katzman', 'Alex Berman'],
    keywords: [
      'tedx', 'mindvalley', 'genius network', 'peak performance', 'personal mastery',
      'high performance summit', 'human optimization', 'human potential', 'mastery summit',
      'thought leader summit'
    ]
  }
};

// HARD EXCLUSIONS
export const EXCLUDED_TITLE_OR_COMPANY_KEYWORDS = [
  'keynote speaker', 'professional speaker', 'speaking coach', 'speaker coach',
  'public speaking coach', 'attendee', 'vendor', 'av company', 'catering',
  'marketing agency', 'pr agency', 'advertising agency', 'convention center',
  'solopreneur', 'retired', 'looking for opportunities', 'church planter',
  'volunteer coordinator', 'mlm', 'network marketing', 'direct sales',
  'destination management', 'wedding planner', 'quinceanera', 'quinceañera',
  'bridal', 'event staffing', 'ticket platform'
];

export const TRAP_COMPANIES = [
  'linkedin', 'microsoft', 'google', 'apple', 'amazon', 'meta', 'facebook',
  'oracle', 'salesforce', 'adobe', 'ibm', 'vistage', 'eventbrite', 'cvent', 'bizzabo',
  'ypo', 'young presidents organization', 'entrepreneurs organization',
  'women presidents organization', 'wpo', 'tiger 21', 'strategic coach', 'provisors'
];

export const TRAP_INDUSTRIES = [
  'sports', 'professional sports', 'esports', 'fashion', 'apparel', 'luxury goods',
  'wedding', 'bridal', 'quinceanera', 'gambling', 'casino', 'adult entertainment', 'mlm'
];

export const SPORTS_TEAM_KEYWORDS = [
  'orlando city sc', 'austin fc', 'la galaxy', 'inter miami', 'nyc fc', 'sounders',
  'cowboys', 'patriots', 'eagles', 'chiefs', '49ers', 'packers', 'steelers',
  'lakers', 'warriors', 'celtics', 'bulls', 'knicks', 'heat', 'spurs',
  'yankees', 'dodgers', 'mets', 'cubs', 'red sox', 'braves', 'astros'
];

// PAY-TO-PLAY / SPONSORSHIP-REQUIRED TRAPS (Immediate Rejection)
export const PAY_TO_PLAY_KEYWORDS = [
  'pay to speak', 'paid speaking package', 'speaker sponsorship required',
  'sponsorship is required to speak', 'must purchase a booth', 'speaker fee required from speaker',
  'buy a speaking slot', 'sponsored speaking slot only'
];

// UNPAID / VOLUNTEER / NO-HONORARIUM NEGATION PATTERNS
export const UNPAID_NEGATION_PATTERNS = [
  /\b(do not|does not|not|no|unable to)\s+(offer|provide|pay|receive|include)\s+(any\s+)?(monetary compensation|compensation|an honorarium|honorariums|honoraria|speaker fee|speaking fee|stipend)/i,
  /\bno\s+(speaking\s+fee|speaker\s+fee|honorarium|honorariums|stipend)/i,
  /\bvolunteer\s+opportunity\b/i,
  /\bspeaking\s+is\s+pro\s+bono\b/i,
  /\bpresentations\s+are\s+pro\s+bono\b/i
];

// EXPLICIT PAID GIG / HONORARIUM SIGNALS (+20 boost & TIER_A_PAID_GIG classification)
export const PAID_GIG_KEYWORDS = [
  'honorarium', 'speaker fee', 'speaking fee', 'stipend', 'paid keynote',
  'paid speakers', 'compensated speaker', 'speaker budget', 'keynote budget',
  'fee range', 'standard speaking fee', 'speaker compensation', 'honoraria'
];

// HIGH-EXPOSURE / HIGH-VALUE AUDIENCE SIGNALS (Qualifies CFP as TIER_B_HIGH_EXPOSURE_CFP)
export const HIGH_EXPOSURE_SIGNALS = [
  'c-suite', 'executives', 'founders', 'ceos', 'decision makers', 'investors',
  'physicians', 'doctors', 'business owners', 'senior pastors', 'book signing',
  'lead generation', 'vip reception', 'media coverage', 'press coverage',
  'travel covered', 'travel and lodging', 'hotel and airfare', 'travel stipend',
  '500+ attendees', '1,000+ attendees', '1000+ attendees', '2,000+ attendees',
  'national conference', 'annual conference', 'annual convention', 'title sponsor',
  'platinum sponsor', 'ticketed event'
];

// TIER DEFINITIONS
export const TIER_1_KEYWORDS = [
  'conference producer', 'senior conference producer', 'programming director',
  'director of programming', 'head of events', 'director of events', 'vp events',
  'vp of events', 'vice president of events', 'chief events officer', 'head of programming',
  'programming lead', 'summit founder', 'festival director', 'event director',
  'conference chair', 'program chair', 'director of conference programming',
  'director of speaker curation', 'head of content', 'talent buyer', 'conference director',
  'summit director', 'executive producer', 'director of education', 'vp of education',
  'vice president of education', 'director of conferences', 'senior director of events',
  'chief learning officer', 'director of meetings'
];

export const TIER_2_KEYWORDS = [
  'community manager', 'meetup organizer', 'mastermind host', 'mastermind curator',
  'online community host', 'head of community', 'membership director', 'conference coordinator',
  'director of community', 'events manager', 'senior events manager', 'program manager',
  'conference manager', 'education manager'
];

export const TIER_3_KEYWORDS = [
  'booking agent', 'speaker booker', 'events coordinator', 'event coordinator',
  'programming associate', 'speaker relations manager', 'speaker relations',
  'content curator', 'conference assistant', 'event producer'
];

export const CFP_SPECIFIC_PATTERNS = [
  /\/speak\b/i,
  /\/cfp\b/i,
  /\/call-for-speakers/i,
  /\/call-for-papers/i,
  /\/call-for-presentations/i,
  /\/speaker-applications/i,
  /\/apply-to-speak/i,
  /\/speaker-submissions/i,
  /\/become-a-speaker/i,
  /\/speakers\/apply/i,
  /\/propose-a-speaker/i,
  /\/pitch-us/i,
  /\/speaking-opportunities/i,
  /\/speaker-inquiry/i,
  /\/submit-a-talk/i,
  /\/call-for-proposals/i
];

export const CFP_TEXT_KEYWORDS = [
  'cfp open', 'cfp is open', 'cfp now open', 'call for speakers', 'call for papers',
  'call for proposals', 'call for presentations', 'speaker applications', 'speaker submissions',
  'submissions open', 'apply to speak', 'nominate a speaker', 'booking speakers',
  'we are booking speakers', 'speaker pitch', 'pitch us', 'speaking opportunity', 'submit your talk'
];

export const BIO_BOOST_KEYWORDS = [
  'event producer', 'conference organizer', 'conference producer', 'i produce events',
  'i organize events', 'founder @', 'founder of', 'event founder', 'summit founder',
  'event strategist', 'event curator', 'festival director', 'we host events',
  'hosting events', 'event series', 'we organize', 'we produce', 'we run',
  'we curate', 'organizing events', 'events team', 'events programming',
  'events division', 'events department', 'organizer of', 'producer of',
  'annual conference', 'keynote speakers', 'speaker lineup'
];

export const ACTIVITY_KEYWORDS = [
  'event', 'events', 'conference', 'summit', 'festival', 'lineup', 'speakers',
  'agenda', 'program', 'hosting', 'hosted by', 'hosted our', '2026 lineup',
  '2027 lineup', '2026 speakers', '2027 speakers', 'register now', 'tickets',
  'sponsors', 'convention', 'symposium'
];

export const BUDGET_KEYWORDS = [
  'sponsored by', 'our sponsors', 'corporate sponsors', 'title sponsor',
  'platinum sponsor', 'gold sponsor', 'paid speakers', 'honorarium', 'speaker fee',
  'travel covered', 'travel + hotel', 'travel and lodging', 'budget', 'funded by',
  'grant', 'venue partner', 'hotel partner', 'paid event', 'ticketed event', 'registration fee'
];

export const RECURRENCE_PATTERNS = [
  /\b([2-9]|[1-9][0-9])(nd|rd|th)\s+annual\b/i,
  /\b([2-9]|[1-9][0-9])(nd|rd|th)\s+edition\b/i,
  /\b202[67]\s+(lineup|speakers|summit|conference|convention)\b/i,
  /\breturning\s+speakers\b/i,
  /\bjoin\s+us\s+again\b/i,
  /\bback\s+for\s+the\b/i,
  /\b(every|each)\s+year\b/i,
  /\byearly\b/i,
  /\bannual\s+(conference|summit|event|gathering|convention|symposium)\b/i
];

export const NEGATIVE_SIGNALS = [
  { pattern: 'we are not accepting speaker applications', penalty: -10 },
  { pattern: 'not accepting speakers', penalty: -10 },
  { pattern: 'not looking for speakers', penalty: -10 },
  { pattern: 'we are a vendor', penalty: -15 },
  { pattern: 'we are sponsors', penalty: -10 },
  { pattern: 'sponsoring the event', penalty: -10 },
  { pattern: 'we no longer organize', penalty: -10 },
  { pattern: 'no longer hosting', penalty: -10 },
  { pattern: 'event has passed', penalty: -5 },
  { pattern: 'past event', penalty: -5 },
  { pattern: 'one-off event', penalty: -3 },
  { pattern: 'one off event', penalty: -3 }
];

export function containsKeyword(text, keyword) {
  if (!text || !keyword) return false;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
  return regex.test(text);
}

export function matchRosterTopics(lead) {
  const searchableFields = [
    lead.title,
    lead.company,
    lead.industry,
    lead.bio,
    lead.headline,
    lead.recentPostSnippet,
    ...(lead.actualEvents || []).map(e => `${e.name || ''} ${e.description || ''} ${e.topics || ''}`),
    ...(lead.additionalRoles || [])
  ].filter(Boolean).join(' | ');

  const matchedTopics = [];
  const matchedSpeakersSet = new Set();
  const topicEvidence = {};

  for (const [topicKey, config] of Object.entries(ROSTER_TOPICS)) {
    const hits = config.keywords.filter(kw => containsKeyword(searchableFields, kw));
    if (hits.length > 0) {
      matchedTopics.push(topicKey);
      topicEvidence[topicKey] = hits.slice(0, 3);
      config.speakers.forEach(s => matchedSpeakersSet.add(s));
    }
  }

  return {
    matchedTopics,
    matchedSpeakers: Array.from(matchedSpeakersSet),
    topicEvidence
  };
}

/**
 * Classifies the event's monetization & speaker value tier:
 * - TIER_A_PAID_GIG: Pays speaker honorarium/fee OR is a high-ticket commercial/association conference that hires paid keynotes
 * - TIER_B_HIGH_EXPOSURE_CFP: Unpaid/travel-only CFP, but high-value C-suite/buyer audience (200+ attendees), book signing, or premier brand exposure
 * - REJECT_PAY_TO_PLAY: Demands speaker pay/sponsor to get on stage
 * - REJECT_LOW_VALUE_CFP: Unpaid CFP with no strong audience/budget/exposure signals
 */
export function evaluateMonetization(lead) {
  const fullCorpus = [
    lead.recentPostSnippet,
    lead.bio,
    lead.notes,
    lead.companyResearch?.monetizationEvidence,
    ...(lead.actualEvents || []).map(e => `${e.name || ''} ${e.description || ''} ${e.compensationNote || ''}`)
  ].filter(Boolean).join(' | ');

  // 1. Check Pay-to-Play traps first
  const payToPlayHit = PAY_TO_PLAY_KEYWORDS.find(kw => containsKeyword(fullCorpus, kw));
  if (payToPlayHit || lead.companyResearch?.isPayToPlay === true) {
    return {
      monetizationTier: 'REJECT_PAY_TO_PLAY',
      validMonetization: false,
      reason: `Pay-to-Play / Sponsorship required trap detected ("${payToPlayHit || 'isPayToPlay=true'}")`,
      bonus: -100
    };
  }

  // 2. Check Explicit Unpaid / Volunteer Negations (unless explicitly overridden by paysSpeakers === 'yes')
  const hasUnpaidNegation = UNPAID_NEGATION_PATTERNS.some(rx => rx.test(fullCorpus));
  const explicitNoPay = lead.companyResearch?.paysSpeakers === 'no' && lead.companyResearch?.paysKeynotes !== 'yes';

  // 3. Check Explicit Paid Gig / Honorarium signals (only if not negated!)
  const paidHits = (!hasUnpaidNegation && !explicitNoPay)
    ? PAID_GIG_KEYWORDS.filter(kw => containsKeyword(fullCorpus, kw))
    : [];
  const explicitPaidFlag = lead.companyResearch?.paysSpeakers === 'yes' || lead.companyResearch?.paysKeynotes === 'yes';
  const highTicketPaid = !explicitNoPay && !hasUnpaidNegation && Number(lead.companyResearch?.estimatedTicketPriceUSD || 0) >= 499;

  if (explicitPaidFlag || paidHits.length > 0 || highTicketPaid) {
    const signals = [
      ...(explicitPaidFlag ? ['confirmed paid keynote/speaker budget'] : []),
      ...paidHits.slice(0, 3),
      ...(Number(lead.companyResearch?.estimatedTicketPriceUSD || 0) >= 299 ? [`ticket price $${lead.companyResearch.estimatedTicketPriceUSD}+`] : [])
    ];
    return {
      monetizationTier: 'TIER_A_PAID_GIG',
      validMonetization: true,
      reason: `TIER A (Paid Speaker / Keynote Budget): ${signals.join(', ')}`,
      bonus: 15
    };
  }

  // 4. Check High-Exposure / High-ROI Audience CFP signals
  const exposureHits = HIGH_EXPOSURE_SIGNALS.filter(kw => containsKeyword(fullCorpus, kw));
  const minAttendees = Number(lead.companyResearch?.estimatedAttendees || 0);
  const highExposureFlag = lead.companyResearch?.highValueExposure === 'yes';

  if (highExposureFlag || (minAttendees >= 200 && exposureHits.length >= 2)) {
    return {
      monetizationTier: 'TIER_B_HIGH_EXPOSURE_CFP',
      validMonetization: true,
      reason: `TIER B (High-Exposure / High-ROI Audience CFP): ${exposureHits.slice(0, 3).join(', ') || `${minAttendees}+ attendees`}`,
      bonus: 10
    };
  }

  return {
    monetizationTier: 'REJECT_LOW_VALUE_CFP',
    validMonetization: false,
    reason: `Low-value unpaid CFP rejected (${hasUnpaidNegation ? 'explicitly states no honorarium/volunteer only' : 'no honorarium and insufficient high-ticket audience signals'})`,
    bonus: -20
  };
}

export async function verifyEmailDomainMX(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].trim().toLowerCase();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.Answer) && data.Answer.some(a => a.type === 15)) {
        return true;
      }
    }
  } catch {
    // fallback to local dns
  }
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 1500));
    const records = await Promise.race([dns.resolveMx(domain), timeoutPromise]);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

export function validateLead(lead) {
  const errors = [];

  // 1. Geography check
  const isGlobal = Boolean(lead.globalEventOrganizer);
  if (!isGlobal) {
    if (lead.country !== 'US') {
      errors.push(`Invalid country "${lead.country}" (must be US unless globalEventOrganizer=true)`);
    }
    if (!lead.state || !US_STATES.has(String(lead.state).toUpperCase())) {
      errors.push(`Invalid US state code "${lead.state}"`);
    }
    if (!lead.city || NON_US_CITIES.includes(String(lead.city).trim().toLowerCase())) {
      errors.push(`Missing or non-US city "${lead.city}"`);
    }
  }

  // 2. LinkedIn URL format
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)\/?$/i;
  const match = String(lead.linkedinUrl || '').match(linkedinRegex);
  if (!match) {
    errors.push(`Invalid LinkedIn URL format: "${lead.linkedinUrl}"`);
  } else {
    const slug = match[2].toLowerCase();
    if (['fake', 'test', 'dummy', 'example', 'user', 'profile', 'null', 'undefined'].some(bad => slug === bad || slug.startsWith(`${bad}-`))) {
      errors.push(`Suspicious LinkedIn slug: "${slug}"`);
    }
  }

  // 3. Company presence
  if (!lead.company || String(lead.company).trim() === '') {
    errors.push('Missing company name');
  }

  // 4. Email format
  if (lead.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.email)) {
      errors.push(`Invalid email format: "${lead.email}"`);
    }
  }

  // 5. Followers cap (>30,000 excluded)
  if (typeof lead.linkedinFollowers === 'number' && lead.linkedinFollowers > 30000) {
    errors.push(`LinkedIn followers (${lead.linkedinFollowers}) exceeds 30,000 celebrity cap`);
  }

  // 6. Hard Exclusions
  const titleAndCompany = `${lead.title || ''} | ${lead.company || ''}`;
  for (const kw of EXCLUDED_TITLE_OR_COMPANY_KEYWORDS) {
    if (containsKeyword(titleAndCompany, kw)) {
      errors.push(`Excluded keyword in title/company: "${kw}"`);
    }
  }
  for (const trap of TRAP_COMPANIES) {
    if (containsKeyword(lead.company || '', trap)) {
      errors.push(`Trap company / Peer advisory excluded: "${trap}"`);
    }
  }
  for (const team of SPORTS_TEAM_KEYWORDS) {
    if (containsKeyword(lead.company || '', team)) {
      errors.push(`Sports team excluded: "${team}"`);
    }
  }
  for (const ind of TRAP_INDUSTRIES) {
    if (containsKeyword(lead.industry || '', ind)) {
      errors.push(`Trap industry excluded: "${ind}"`);
    }
  }

  // 7. v1.7 Exclusion: No Podcasts
  if (String(lead.eventOrgType || '').toLowerCase() === 'podcast') {
    errors.push('Podcasts are excluded per ICP v1.7');
  }

  // 8. v1.12 Mandatory External Speakers & Target Event Verification
  if (!lead.companyResearch || lead.companyResearch.acceptsExternalSpeakers !== 'yes') {
    errors.push('v1.12 Violation: companyResearch.acceptsExternalSpeakers must be "yes"');
  }
  if (lead.companyResearch?.isInternalCorporateEvent === true) {
    errors.push('v1.12 Violation: Internal corporate events are excluded');
  }
  if (lead.companyResearch?.isEventAgencyOrVendor === true) {
    errors.push('v1.12 Violation: Event agencies/vendors producing events for third parties are excluded');
  }
  if (!Array.isArray(lead.actualEvents) || lead.actualEvents.length === 0) {
    errors.push('v1.12 Violation: Must include at least 1 verified event in actualEvents[]');
  }

  // 9. Monetization & Value Gate (NEW v2.0: Must be TIER_A_PAID_GIG or TIER_B_HIGH_EXPOSURE_CFP)
  const monetization = evaluateMonetization(lead);
  if (!monetization.validMonetization) {
    errors.push(`Monetization Gate Violation: ${monetization.reason}`);
  }

  // 10. Topic Match or External Commission Eligibility
  const topicResult = matchRosterTopics(lead);
  const isPaidExternalCommission = monetization.monetizationTier === 'TIER_A_PAID_GIG' && lead.allowExternalCommission === true;
  if (topicResult.matchedTopics.length === 0 && !isPaidExternalCommission) {
    errors.push('v1.13 Violation: 0 matches against the 24 ROSTER_TOPICS (and not flagged as TIER_A_PAID_GIG external commission)');
  }

  return {
    valid: errors.length === 0,
    errors,
    topicResult,
    monetization
  };
}

export function scoreLead(lead) {
  const validation = validateLead(lead);
  const reasons = [];
  let score = 0;

  if (!validation.valid) {
    return {
      valid: false,
      score: 0,
      tier: 'REJECTED',
      monetizationTier: validation.monetization.monetizationTier,
      dealType: 'NONE',
      qualified: false,
      errors: validation.errors,
      reasons: validation.errors,
      matchedTopics: validation.topicResult.matchedTopics,
      matchedSpeakers: validation.topicResult.matchedSpeakers
    };
  }

  // 1. Title Tier Score
  const titleLower = String(lead.title || '').toLowerCase();
  let tier = 'T4';
  if (TIER_1_KEYWORDS.some(k => containsKeyword(titleLower, k))) {
    tier = 'T1';
    score += 50;
    reasons.push('Tier 1 Decision Maker (+50)');
  } else if (TIER_2_KEYWORDS.some(k => containsKeyword(titleLower, k))) {
    tier = 'T2';
    score += 40;
    reasons.push('Tier 2 Community/Event Builder (+40)');
  } else if (TIER_3_KEYWORDS.some(k => containsKeyword(titleLower, k))) {
    tier = 'T3';
    score += 25;
    reasons.push('Tier 3 Operational/Speaker Relations (+25)');
  } else {
    tier = 'T4';
    score += 10;
    reasons.push('Tier 4 Event Role (+10)');
  }

  // 2. Monetization Tier Bonus (v2.0)
  score += validation.monetization.bonus;
  reasons.push(`${validation.monetization.reason} (+${validation.monetization.bonus})`);

  // 3. Company Size Bonus
  const emp = Number(lead.companyEmployees || 0);
  if (emp === 1) {
    score -= 5;
    reasons.push('Solo founder 1 employee (-5)');
  } else if (emp >= 2 && emp <= 10) {
    score += 5;
    reasons.push('Boutique event org 2-10 employees (+5)');
  } else if (emp >= 11 && emp <= 50) {
    score += 10;
    reasons.push('Sweet spot event org 11-50 employees (+10)');
  } else if (emp >= 51 && emp <= 200) {
    score += 5;
    reasons.push('Established org 51-200 employees (+5)');
  } else if (emp > 1000) {
    if (lead.globalEventOrganizer) {
      score += 5;
      reasons.push('Global top-tier organizer override (+5)');
    } else {
      score -= 5;
      reasons.push('Enterprise >1000 employees (-5)');
    }
  }

  // 4. Roster Topic Match Score & Deal Type
  const topicCount = validation.topicResult.matchedTopics.length;
  let dealType = 'ROSTER_PLACEMENT';
  if (topicCount >= 2) {
    score += 10;
    reasons.push(`Multi-topic roster match (${validation.topicResult.matchedTopics.slice(0, 3).join(', ')}) (+10)`);
  } else if (topicCount === 1) {
    score += 5;
    reasons.push(`Single topic roster match (${validation.topicResult.matchedTopics[0]}) (+5)`);
  } else {
    dealType = 'EXTERNAL_COMMISSION_OPPORTUNITY';
    reasons.push('Open-Market Paid Gig: Eligible for External Speaker Commission (0 internal roster match)');
  }

  if (validation.monetization.monetizationTier === 'TIER_A_PAID_GIG' && topicCount >= 1) {
    dealType = 'ROSTER_OR_EXTERNAL_PAID_GIG';
  }

  // 5. CFP URL Pattern Detection (v1.10 #2)
  if (lead.cfpUrl) {
    const isSpecificPattern = CFP_SPECIFIC_PATTERNS.some(rx => rx.test(lead.cfpUrl));
    if (isSpecificPattern) {
      score += 10;
      reasons.push(`Specific CFP/Speaker Inquiry URL pattern (${lead.cfpUrl}) (+10)`);
    } else {
      score += 5;
      reasons.push(`Generic CFP/Event URL present (+5)`);
    }
  }

  // 6. CFP / Speaker Inquiry Detection in text (+15)
  const textCorpus = `${lead.recentPostSnippet || ''} | ${lead.bio || ''} | ${lead.notes || ''}`;
  const cfpHit = CFP_TEXT_KEYWORDS.find(kw => containsKeyword(textCorpus, kw));
  if (lead.cfpOpen === true || cfpHit) {
    score += 15;
    reasons.push(`Active Call for Speakers / Speaker Inquiry detected${cfpHit ? ` ("${cfpHit}")` : ''} (+15)`);
  }

  // 7. Bio Keyword Scan
  const bioCorpus = `${lead.title || ''} | ${lead.bio || ''} | ${lead.headline || ''} | ${lead.recentPostSnippet || ''}`;
  const bioHits = BIO_BOOST_KEYWORDS.filter(kw => containsKeyword(bioCorpus, kw));
  if (bioHits.length > 0) {
    score += 5;
    reasons.push(`Organizer bio keywords (${bioHits.slice(0, 3).join(', ')}) (+5)`);
  }

  // 8. Recent Event Post Recency
  if (typeof lead.recentPostDaysAgo === 'number') {
    const days = lead.recentPostDaysAgo;
    if (days <= 30) {
      score += 15;
      reasons.push('Recent event post <30 days (+15)');
    } else if (days <= 60) {
      score += 12;
      reasons.push('Recent event post 30-60 days (+12)');
    } else if (days <= 120) {
      score += 8;
      reasons.push('Recent event post 60-120 days (+8)');
    } else if (days > 180 && days <= 365) {
      score -= 5;
      reasons.push('Stale post 180-365 days (-5)');
    } else if (days > 365) {
      score -= 8;
      reasons.push('Post >1 year old (-8)');
    }
  }

  // 9. Event Activity Keywords (+5 each, max +15)
  const activityHits = ACTIVITY_KEYWORDS.filter(kw => containsKeyword(textCorpus, kw));
  if (activityHits.length > 0) {
    const pts = Math.min(15, activityHits.length * 5);
    score += pts;
    reasons.push(`Event activity signals (${activityHits.slice(0, 3).join(', ')}) (+${pts})`);
  }

  // 10. Budget Signals (+5 each, max +15)
  const budgetHits = BUDGET_KEYWORDS.filter(kw => containsKeyword(textCorpus, kw));
  if (budgetHits.length > 0) {
    const pts = Math.min(15, budgetHits.length * 5);
    score += pts;
    reasons.push(`Speaker budget/sponsor signals (${budgetHits.slice(0, 3).join(', ')}) (+${pts})`);
  }

  // 11. Event Recurrence Signal (+10)
  const hasRecurrence = RECURRENCE_PATTERNS.some(rx => rx.test(textCorpus)) ||
    ['annual', 'monthly', 'weekly', 'series'].includes(String(lead.recurrence || '').toLowerCase());
  if (hasRecurrence) {
    score += 10;
    reasons.push('Recurring annual/series event confirmed (+10)');
  }

  // 12. Event Type Bonus (+5)
  const orgType = String(lead.eventOrgType || '').toLowerCase();
  if (['conference', 'festival', 'summit', 'association'].includes(orgType)) {
    score += 5;
    reasons.push(`Premium event format: ${orgType} (+5)`);
  } else if (orgType === 'mastermind') {
    score += 3;
    reasons.push('Mastermind format (+3)');
  } else if (orgType === 'other' || !orgType) {
    score -= 5;
    reasons.push('Unspecified event type (-5)');
  }

  // 13. Contact & Profile Completeness
  if (lead.linkedinUrl) {
    score += 10;
    reasons.push('Valid LinkedIn URL (+10)');
  }
  if (lead.email) {
    score += 10;
    reasons.push('Direct email present (+10)');
    const domain = lead.email.split('@')[1]?.toLowerCase();
    if (domain && !FREE_EMAIL_DOMAINS.has(domain)) {
      score += 5;
      reasons.push(`Custom corporate email domain @${domain} (+5)`);
    }
  }
  if (lead.phone) {
    score += 5;
    reasons.push('Phone number present (+5)');
  }

  // 14. LinkedIn Followers Sweet Spot
  if (typeof lead.linkedinFollowers === 'number') {
    const f = lead.linkedinFollowers;
    if (f < 500) {
      score -= 5;
      reasons.push('Followers <500 (-5)');
    } else if (f >= 500 && f <= 5000) {
      score += 5;
      reasons.push(`Followers in reachable sweet spot (${f}) (+5)`);
    } else if (f > 10000) {
      score -= 5;
      reasons.push(`Followers >10k harder to reach (${f}) (-5)`);
    }
  }

  // 15. Geography Bonus
  if (lead.country === 'US' && US_STATES.has(String(lead.state).toUpperCase())) {
    score += 5;
    reasons.push(`Verified US location (${lead.city}, ${lead.state}) (+5)`);
  } else if (lead.globalEventOrganizer) {
    score += 5;
    reasons.push('Global Event Organizer with US reach (+5)');
  }

  // 16. Negative Signals Check
  for (const neg of NEGATIVE_SIGNALS) {
    if (containsKeyword(textCorpus, neg.pattern)) {
      score += neg.penalty;
      reasons.push(`Negative signal "${neg.pattern}" (${neg.penalty})`);
      break;
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const qualified = finalScore >= 70;

  return {
    valid: true,
    score: finalScore,
    tier,
    monetizationTier: validation.monetization.monetizationTier,
    dealType,
    qualified,
    errors: [],
    reasons,
    matchedTopics: validation.topicResult.matchedTopics,
    matchedSpeakers: validation.topicResult.matchedSpeakers,
    topicEvidence: validation.topicResult.topicEvidence
  };
}

// CLI Runner: node src/scoring.mjs <input.json> [--out-dir <dir>]
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.log('Usage: node src/scoring.mjs <path-to-leads.json>');
    process.exit(0);
  }
  const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const leads = Array.isArray(raw) ? raw : [raw];
  const approved = [];
  const rejected = [];

  for (const lead of leads) {
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

  const outDir = path.dirname(path.resolve(inputFile));
  const approvedPath = path.join(outDir, 'leads-aprobados.json');
  fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2), 'utf8');

  // Also generate CSV for immediate use in CRM / Google Sheets
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
  fs.writeFileSync(path.join(outDir, 'leads-aprobados.csv'), csvRows.join('\n'), 'utf8');

  console.log(JSON.stringify({
    summary: {
      total: leads.length,
      approved: approved.length,
      rejected: rejected.length,
      tierAPaidGigs: approved.filter(a => a.monetizationTier === 'TIER_A_PAID_GIG').length,
      tierBHighExposure: approved.filter(a => a.monetizationTier === 'TIER_B_HIGH_EXPOSURE_CFP').length
    },
    approved,
    rejected
  }, null, 2));
  process.exit(0);
}
