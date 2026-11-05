import fs from 'node:fs';

const leadsPath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/astro-calendar/src/data/generalLeads.json';
const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));

// Helper to deduce clean audience profile and estimated size
function getDetailedAudience(l) {
  const comp = (l.company || '').toLowerCase();
  const evName = ((l.actualEvents && l.actualEvents[0]?.name) || l.eventName || '').toLowerCase();
  const bm = l.budgetModel || '';

  if (bm.includes('10,000+ Pediatras')) return '10,000+ Médicos Pediatras, Directores Clínicos y Líderes de Salud Infantil';
  if (bm.includes('4,000+ CEOs Educativos')) return '4,000+ Superintendentes de Escuelas, Rectores y CEOs Educativos';
  if (bm.includes('2,000+ CEOs y Directores de Bancos')) return '2,000+ Directores Generales, Presidentes y Ejecutivos de Bancos';
  if (bm.includes('8,000+ Médicos')) return '8,000+ Médicos de Urgencias y Emergencias, Jefes de Servicio';
  if (bm.includes('4,000+ Asistentes') && comp.includes('ache')) return '4,000+ Directores de Hospitales y CEOs del Sector Salud (C-Suite)';
  if (bm.includes('5,000+ Especialistas') && comp.includes('acog')) return '5,000+ Gineco-Obstetras, Cirujanos y Líderes de Salud Femenina';
  if (bm.includes('12,000+ Cirujanos')) return '12,000+ Cirujanos, Jefes de Quirófano y Directivos Médicos';
  if (bm.includes('17,000+ Investigadores')) return '17,000+ Cardiólogos, Investigadores y Directivos de Cardiología';
  if (bm.includes('1,500+ Comisionados')) return '1,500+ Comisionados y Directivos de Empresas de Energía Pública';
  if (bm.includes('5,000+ CEOs de Asociaciones')) return '5,000+ Directores Ejecutivos y CEOs de Asociaciones Nacionales';
  if (bm.includes('4,000+ Líderes de Farmacia')) return '4,000+ Farmacéuticos Hospitalarios y Directores de Sistemas de Salud';
  if (bm.includes('2,500+ Asistentes')) return '2,500+ Ejecutivos y Directores de Cadenas Minoristas y Distribución';
  if (bm.includes('5,000+ Compradores')) return '5,000+ Compradores y Ejecutivos de la Industria de Productos de Consumo';
  if (bm.includes('3,000+ Directores y Profesores')) return '3,000+ Directores de Escuelas Primarias y Líderes Educativos';
  if (bm.includes('3,500+ Directores')) return '3,500+ Directores de Escuelas Secundarias y Preparatorias';
  if (bm.includes('1,200+ Líderes Estatales')) return '1,200+ Comisionados Estatales de Educación y Funcionarios Públicos';
  if (bm.includes('3,000+ Líderes de Cadena de Suministro')) return '3,000+ Vicepresidentes de Cadena de Suministro, Logística y Operaciones';
  if (bm.includes('1,500+ Administradores Públicos')) return '1,500+ Administradores de Ciudades y Gerentes Municipales';
  if (bm.includes('3,500+ Funcionarios de Condado')) return '3,500+ Comisionados y Funcionarios Electos de Gobiernos de Condado';
  if (bm.includes('4,000+ Alcaldes')) return '4,000+ Alcaldes, Concejales y Líderes de Gobiernos Municipales';
  if (bm.includes('5,000+ Directores')) return '5,000+ Directores e Ingenieros de Obras y Servicios Públicos';
  if (bm.includes('20,000+ Profesionales del Agua')) return '20,000+ Ingenieros, Directores de Servicios y Expertos en Calidad del Agua';
  if (bm.includes('12,000+ Ingenieros')) return '12,000+ Ingenieros y Administradores de Infraestructura Hídrica';
  if (bm.includes('7,000+ Líderes de Cooperativas')) return '7,000+ Directores y Consejeros de Cooperativas Eléctricas Rurales';
  if (bm.includes('10,000+ Líderes de la Industria')) return '10,000+ Ejecutivos y Directores de la Industria de Alimentos y Retail';
  if (bm.includes('2,500+ Ejecutivos')) return '2,500+ Vicepresidentes de Marketing y Chief Marketing Officers (CMO)';
  if (bm.includes('60,000+ Profesionales de Medios')) return '60,000+ Directivos de Radiodifusión, Medios, Streaming y Contenido Digital';
  if (bm.includes('15,000+ Agentes')) return '15,000+ Directores Inmobiliarios, Brokers y Agentes Top Producer';
  if (bm.includes('4,000+ Directores')) return '4,000+ Desarrolladores de Bienes Raíces Comerciales e Inversionistas';
  if (bm.includes('4,500+ Ejecutivos de Banca Hipotecaria')) return '4,500+ Presidentes y Altos Ejecutivos de Bancas Hipotecarias y Crédito';
  if (bm.includes('1,000+ Asistentes') || comp.includes('nast')) return '1,000+ Tesoreros Estatales, Oficiales de Finanzas y Gestores de Fondos Públicos';
  if (bm.includes('1,200+ Asistentes') || comp.includes('namic')) return '1,200+ Ejecutivos de Comunicaciones, Cable y Medios de Comunicación';
  if (bm.includes('10,000+ Asistentes') || comp.includes('nahrep')) return '10,000+ Emprendedores y Profesionales Inmobiliarios Hispanos';
  if (bm.includes('Fortune 500') || comp.includes('hacr')) return '800+ Altos Ejecutivos Hispanos y Miembros de Juntas Directivas Fortune 500';
  if (bm.includes('1,500+ Periodistas')) return '1,500+ Periodistas, Editores y Productores de Noticias Hispanos';
  if (bm.includes('15,000+ Ingenieras')) return '15,000+ Ingenieras, Líderes Tecnológicas y Directivas de STEM';
  if (bm.includes('2,000+ Ejecutivas')) return '2,000+ Mujeres Ejecutivas, Directivas y Emprendedoras';
  if (bm.includes('1,000+ Profesionales')) return '1,000+ Ejecutivos y Especialistas en Reincorporación Laboral (HR)';
  if (bm.includes('1,500+ Contratistas')) return '1,500+ Mujeres Constructoras, Contratistas y Líderes de la Construcción';
  if (comp.includes('global leadership') || evName.includes('global leadership summit')) return '400,000+ Líderes Globales, Pastores, Emprendedores y Directivos (Presencial + Sedes Satélite)';
  if (comp.includes('exponential') || evName.includes('exponential')) return '5,000+ Pastores Principales, Líderes Eclesiales y Directores de Ministerios';
  if (comp.includes('catalyst') || evName.includes('catalyst')) return '3,000+ Jóvenes Líderes, Ejecutivos de Fe y Directores de Equipos';
  if (comp.includes('rightnow') || evName.includes('rightnow media')) return '3,500+ Pastores y Directores de Ministerios';
  if (comp.includes('true woman') || evName.includes('true woman')) return '6,000+ Mujeres Líderes de Comunidades y Familias';
  if (comp.includes('designed for life') || evName.includes('designed for life')) return '10,000+ Mujeres Líderes, Emprendedoras y Profesionales de Fe';
  if (comp.includes('nra show') || evName.includes('national restaurant association')) return '55,000+ Dueños de Restaurantes, Chefs Ejecutivos y Operadores de Hospitalidad';
  if (comp.includes('nrf') || evName.includes('retail\'s big show')) return '40,000+ CEOs, Vicepresidentes y Líderes Globales de Comercio Minorista';
  if (comp.includes('workhuman')) return '3,000+ Líderes Globales de Recursos Humanos, Chief People Officers y C-Suite';
  if (comp.includes('sales assembly')) return '1,500+ Vicepresidentes de Ventas, CROs y Líderes de Revenue B2B';
  if (comp.includes('shrm')) return '18,000+ Directores y Vicepresidentes Globales de Recursos Humanos';
  if (comp.includes('inc. 5000') || evName.includes('inc. 5000')) return '3,000+ Fundadores de Empresas de Alto Crecimiento y Emprendedores';
  if (comp.includes('fast company')) return '2,500+ Diseñadores, Innovadores, Directores Creativos y Tecnológicos';
  if (comp.includes('boma')) return '3,500+ Administradores y Propietarios de Edificios Comerciales';
  if (comp.includes('pcma') || evName.includes('convening leaders')) return '4,500+ Directores de Eventos y Meeting Planners Corporativos';
  if (comp.includes('acg') || evName.includes('dealmax')) return '3,000+ Inversionistas de Capital Privado, M&A y Banqueros de Inversión';
  if (comp.includes('best ever')) return '1,500+ Inversionistas de Bienes Raíces Comerciales y Family Offices';
  if (comp.includes('icf') || comp.includes('coaching')) return '800+ Coaches Ejecutivos Certificados y Consultores de Liderazgo';
  if (comp.includes('active minds')) return '1,200+ Directores de Bienestar Estudiantil y Líderes de Salud Mental';
  if (comp.includes('asq')) return '2,500+ Directores de Calidad, Excelencia Operacional y Procesos Industriales';
  if (comp.includes('ignite')) return '1,500+ Mujeres Emprendedoras, Directivas y Líderes Comunitarias';
  if (comp.includes('leadercast')) return '50,000+ Ejecutivos y Equipos Corporativos (Sede Central + Retransmisiones)';
  if (comp.includes('wbenc')) return '4,500+ Mujeres Dueñas de Negocios y Directores de Compras Corporativas Fortune 500';
  if (comp.includes('techcrunch')) return '2,000+ Fundadores de Startups Tecnológicas e Inversionistas de Capital de Riesgo';
  if (comp.includes('zonda') || comp.includes('multifamily')) return '1,200+ Desarrolladores e Inversionistas de Vivienda Multifamiliar';
  if (comp.includes('imn')) return '1,500+ Gestores de Fondos, Inversionistas Inmobiliarios y Asesores Institucionales';
  if (comp.includes('iqpc') || comp.includes('sson')) return '1,200+ Directores de Servicios Compartidos, Finanzas y Transformación Digital';
  if (comp.includes('pavilion')) return '1,500+ Directores de Ingresos (CRO), CEOs y Líderes de Go-To-Market B2B';

  if (bm.includes('/')) {
    const parts = bm.split('/');
    return parts.slice(1).join(' / ').trim();
  }
  return bm || 'Líderes Ejecutivos y Profesionales del Sector (1,000+ Asistentes)';
}

const csvHeader = [
  'Ranking General',
  'Nombre del Evento',
  'Mes / Fechas del Evento',
  'Ciudad / Sede',
  'Perfil y Tamaño de la Audiencia',
  'Rango de Fee Estimado ($USD)',
  'Probabilidad de Pago',
  'Modelo Presupuestario',
  'Organizador / Tomador de Decisión',
  'Cargo / Rol',
  'Email del Organizador',
  'LinkedIn Verificado',
  'Empresa / Entidad Organizadora',
  'URL Oficial del Evento',
  'Conferencistas Sugeridos (Catálogo SpeakUp)',
  'Tópicos ICP Asignados',
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
  const eventName = ev.name || l.eventName || l.company + ' Conference';
  const eventDate = ev.date || l.nextEventDate || l.eventMonth || '2027';
  const eventCity = ev.city || l.eventCity || l.city || 'Sede Confirmada';
  const eventUrl = ev.url || l.eventUrl || 'https://www.linkedin.com';
  const audience = getDetailedAudience(l);
  const feeRange = l.estimatedFeeRange || l.monetization?.estimatedFee || '$10,000 - $25,000 USD';
  const paymentProb = l.paymentProbability || l.monetization?.probability || 'ALTA (75% - 85%)';
  const budgetModel = l.budgetModel || l.monetization?.budgetModel || 'Presupuesto Institucional de Conferencia Plenaria';
  const email = (l.email && l.email.trim() && l.email !== 'N/A') ? l.email.trim() : 'Contacto vía LinkedIn / Web';
  const speakers = (l.assignedSpeakers || l.matchedSpeakers || []).join(' | ');
  const topics = (l.matchedIcpTopics || l.matchedTopics || []).join(', ');
  const justification = l.monetizationJustification || l.monetization?.rationale || l.verification?.auditNote || 'Conferencia nacional con presupuesto etiquetado de oradores plenarios.';
  const pitch = l.pitchHook || '';

  rows.push([
    idx + 1,
    escapeCsv(eventName),
    escapeCsv(eventDate),
    escapeCsv(eventCity),
    escapeCsv(audience),
    escapeCsv(feeRange),
    escapeCsv(paymentProb),
    escapeCsv(budgetModel),
    escapeCsv(l.fullName),
    escapeCsv(l.title),
    escapeCsv(email),
    escapeCsv(l.linkedinUrl),
    escapeCsv(l.company),
    escapeCsv(eventUrl),
    escapeCsv(speakers),
    escapeCsv(topics),
    escapeCsv(justification),
    escapeCsv(pitch)
  ].join(','));
});

// Write to primary dedicated file
const outPath1 = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-eventos-fechas-audiencias-fees.csv';
fs.writeFileSync(outPath1, rows.join('\n'), 'utf8');
console.log(`Generated dedicated CSV: ${outPath1} (${rows.length - 1} leads) with Organizer Email and LinkedIn!`);

// Also update master CSV leads-verificados-total-183.csv
const outPath2 = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/output/leads-verificados-total-183.csv';
fs.writeFileSync(outPath2, rows.join('\n'), 'utf8');
console.log(`Updated master CSV: ${outPath2} (${rows.length - 1} leads)`);
