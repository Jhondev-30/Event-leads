import fs from 'node:fs';

const content = fs.readFileSync('c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/index.html', 'utf8');
console.log('File size:', content.length);
console.log('Has GSAP:', content.includes('gsap'));
console.log('Has Philip Chan tab:', content.includes('Philip Chan') || content.includes('philip'));
console.log('Has Timeline/Carril:', content.includes('timeline') || content.includes('Carril'));
console.log('Has Table view:', content.includes('table') || content.includes('Hoja'));
console.log('Has Detail page link:', content.includes('detail.html'));
