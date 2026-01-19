import fs from 'fs';
import path from 'path';

// Load Data
const leads = JSON.parse(fs.readFileSync('../agency-scraper/leads_spain.json', 'utf-8'));
const template = fs.readFileSync('index.html', 'utf-8');
const comingSoonTemplate = fs.readFileSync('coming-soon.html', 'utf-8');

// Varied Assets to make them look different
const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&w=1600&q=80', // Modern White Main
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&w=1600&q=80', // Living Room
    'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&w=1600&q=80', // Kitchen
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&w=1600&q=80'  // Kitchen Light
];

const COLORS = [
    { name: 'naranja', hex: '#f97316' }, // orange-500
    { name: 'azul', hex: '#2563eb' },    // blue-600
    { name: 'verde', hex: '#16a34a' }    // green-600
];

if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
}

leads.forEach((lead: any, index: number) => {
    let customHtml = template;
    let customComingSoon = comingSoonTemplate;

    // 1. Text Injection for Index
    customHtml = customHtml.replace(/{{BUSINESS_NAME}}/g, lead.name);
    customHtml = customHtml.replace(/{{PHONE}}/g, lead.phone);
    customHtml = customHtml.replace(/{{CITY}}/g, "Madrid"); // Default for now

    // 2. Text Injection for Coming Soon
    customComingSoon = customComingSoon.replace(/{{BUSINESS_NAME}}/g, lead.name);
    customComingSoon = customComingSoon.replace(/{{PHONE}}/g, lead.phone);

    // 3. Image Injection (Rotate through images based on index)
    const heroImage = HERO_IMAGES[index % HERO_IMAGES.length];

    // Hacky replace for now if the variable isn't there, but I will update the template next.
    customHtml = customHtml.replace('https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', heroImage);

    // 4. Save unique files
    // Sanitize filename
    const safeName = lead.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const indexFilename = `demo-${safeName}.html`;
    const comingSoonFilename = `coming-soon.html`; // Single file? No, links in index.html point to "coming-soon.html". 
    // IF we are generating multiple demos in the same folder, "coming-soon.html" will be overwritten by the last one.
    // Ideally, each demo should be in its own folder OR we name them differently.
    // However, index.html links to "coming-soon.html" relatively.
    // To make this work for a specific demo without changing the link in index.html dynamically, we might need a folder per lead.
    // OR we can just change the link in (1) to point to `coming-soon-${safeName}.html`.

    // Let's update the link in customHtml to point to the unique coming soon page.
    const uniqueComingSoon = `coming-soon-${safeName}.html`;
    customHtml = customHtml.replace(/coming-soon\.html/g, uniqueComingSoon);

    fs.writeFileSync(path.join('output', indexFilename), customHtml);
    fs.writeFileSync(path.join('output', uniqueComingSoon), customComingSoon);

    console.log(`Generated: output/${indexFilename} & output/${uniqueComingSoon}`);
});

console.log("Done! Check the 'output' folder.");
