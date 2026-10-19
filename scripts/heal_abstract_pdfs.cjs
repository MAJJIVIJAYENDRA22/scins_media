const fs = require('fs');
const path = require('path');

function generateAbstractPdf(data) {
  const sanitize = (str) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[\r\n]+/g, ' ')
      .trim();
  };

  const wrapText = (text, maxCharsPerLine = 75) => {
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    return lines;
  };

  const commands = [];

  // Top header decorative banner
  commands.push('q');
  commands.push('0.06 0.15 0.25 rg');
  commands.push('40 735 532 35 re f');
  commands.push('Q');

  commands.push('BT');
  commands.push('/F2 13 Tf');
  commands.push('1 1 1 rg');
  commands.push('55 748 Td');
  commands.push('(' + sanitize('SCINS MEDIA — OFFICIAL SCIENTIFIC PROCEEDINGS') + ') Tj');
  commands.push('ET');

  commands.push('BT');
  commands.push('/F2 9 Tf');
  commands.push('0.06 0.46 0.43 rg');
  commands.push('50 710 Td');
  const confTitle = sanitize(data.conference_title || 'International Scientific Congress 2026');
  commands.push('(' + confTitle.substring(0, 75) + ') Tj');
  commands.push('/F1 8 Tf');
  commands.push('0.3 0.3 0.3 rg');
  commands.push('0 -14 Td');
  const refId = data.submission_id || 'SCINS-ABS-2026';
  const subDate = data.created_at ? ' | Submitted: ' + data.created_at.substring(0, 16) : '';
  commands.push('(' + sanitize('Submission Ref: ' + refId + subDate) + ') Tj');
  commands.push('ET');

  commands.push('q');
  commands.push('0.8 0.8 0.8 RG');
  commands.push('1 w');
  commands.push('50 682 m 572 682 l S');
  commands.push('Q');

  let currentY = 660;

  commands.push('BT');
  commands.push('/F2 13 Tf');
  commands.push('0.1 0.1 0.1 rg');
  commands.push('50 ' + currentY + ' Td');

  const titleLines = wrapText(data.title || 'Scientific Research Abstract', 58);
  for (let i = 0; i < titleLines.length; i++) {
    if (i > 0) {
      commands.push('0 -16 Td');
      currentY -= 16;
    }
    commands.push('(' + sanitize(titleLines[i]) + ') Tj');
  }
  commands.push('ET');
  currentY -= 26;

  commands.push('q');
  commands.push('0.96 0.97 0.98 rg');
  commands.push('50 ' + (currentY - 60) + ' 522 72 re f');
  commands.push('0.88 0.9 0.92 RG');
  commands.push('1 w');
  commands.push('50 ' + (currentY - 60) + ' 522 72 re S');
  commands.push('Q');

  commands.push('BT');
  commands.push('/F2 10 Tf');
  commands.push('0.06 0.15 0.25 rg');
  commands.push('62 ' + (currentY - 5) + ' Td');
  const authorName = data.primary_author_name || 'Primary Author';
  commands.push('(' + sanitize(authorName) + ') Tj');

  commands.push('/F1 9 Tf');
  commands.push('0.25 0.3 0.35 rg');
  commands.push('0 -14 Td');
  const affil = data.primary_author_affiliation || 'Independent Scientific Researcher';
  const country = data.primary_author_country ? ', ' + data.primary_author_country : '';
  commands.push('(' + sanitize(affil + country) + ') Tj');

  commands.push('0 -13 Td');
  const contactParts = [];
  if (data.primary_author_email) contactParts.push('Email: ' + data.primary_author_email);
  if (data.primary_author_phone) contactParts.push('Tel: ' + data.primary_author_phone);
  commands.push('(' + sanitize(contactParts.join('  |  ')) + ') Tj');

  commands.push('0 -13 Td');
  const formatStr = 'Presentation Preference: ' + (data.presentation_preference || 'Oral') + ' Presentation';
  const domainStr = data.research_domain ? '  |  Domain: ' + data.research_domain : '';
  commands.push('(' + sanitize(formatStr + domainStr) + ') Tj');
  commands.push('ET');

  currentY -= 82;

  commands.push('BT');
  commands.push('/F2 11 Tf');
  commands.push('0.06 0.46 0.43 rg');
  commands.push('50 ' + currentY + ' Td');
  commands.push('(' + sanitize('ABSTRACT') + ') Tj');
  commands.push('ET');
  currentY -= 16;

  const bodyText = data.abstract_text || 'Original scientific research abstract document submitted for peer evaluation and conference proceedings inclusion.';
  const bodyLines = wrapText(bodyText, 74);

  commands.push('BT');
  commands.push('/F1 9.5 Tf');
  commands.push('0.15 0.15 0.15 rg');
  commands.push('50 ' + currentY + ' Td');

  for (let i = 0; i < bodyLines.length; i++) {
    if (currentY < 100) break;
    if (i > 0) {
      commands.push('0 -14 Td');
      currentY -= 14;
    }
    commands.push('(' + sanitize(bodyLines[i]) + ') Tj');
  }
  commands.push('ET');
  currentY -= 24;

  if (data.keywords && currentY > 90) {
    commands.push('BT');
    commands.push('/F2 9 Tf');
    commands.push('0.2 0.2 0.2 rg');
    commands.push('50 ' + currentY + ' Td');
    commands.push('(' + sanitize('Keywords: ' + data.keywords) + ') Tj');
    commands.push('ET');
  }

  commands.push('q');
  commands.push('0.85 0.85 0.85 RG');
  commands.push('1 w');
  commands.push('50 50 m 572 50 l S');
  commands.push('Q');

  commands.push('BT');
  commands.push('/F1 7.5 Tf');
  commands.push('0.5 0.5 0.5 rg');
  commands.push('50 38 Td');
  commands.push('(' + sanitize('SCINS MEDIA Academic Conferences & Scientific Publishing — Confidential Peer Review Copy') + ') Tj');
  commands.push('440 0 Td');
  commands.push('(Page 1 of 1) Tj');
  commands.push('ET');

  const contentStream = commands.join('\n');
  const streamLength = Buffer.byteLength(contentStream, 'utf8');

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];

  const addObj = (objStr) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += objStr + '\n';
  };

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>\nendobj');
  addObj('4 0 obj\n<< /Length ' + streamLength + ' >>\nstream\n' + contentStream + '\nendstream\nendobj');
  addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj');
  addObj('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj');

  const startxref = Buffer.byteLength(pdf, 'utf8');
  pdf += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';

  return Buffer.from(pdf, 'utf8');
}

// 1. Repair Jane Doe's abstract PDF
const janePdf = generateAbstractPdf({
  submission_id: 'BIOPOLYM-ABS-2026-662646',
  conference_title: '2nd World Congress on Biopolymers & Bioplastics',
  title: 'Novel Synthesis of Biodegradable Polyhydroxyalkanoates',
  primary_author_name: 'Dr. Jane Doe',
  primary_author_email: 'jane.doe@biotech-univ.edu',
  primary_author_phone: '+1 (555) 234-5678',
  primary_author_affiliation: 'Department of Bioengineering, Stanford',
  primary_author_country: 'United States',
  presentation_preference: 'Oral',
  research_domain: 'Biopolymers & Bioplastics',
  keywords: 'PHA, Biopolymers, Biodegradation',
  abstract_text: 'This paper presents breakthrough methodology in microbial PHA production. Comprehensive experimental validation demonstrates closed-loop cyclic biopolymer synthesis under controlled fermentation parameters.',
  created_at: '2026-10-11 06:55:43'
});

fs.writeFileSync('public/uploads/abstract_conf_1-1791701743048-4212.pdf', janePdf);
if (fs.existsSync('dist/uploads')) {
  fs.writeFileSync('dist/uploads/abstract_conf_1-1791701743048-4212.pdf', janePdf);
}
console.log('Jane Doe PDF successfully healed. Size:', janePdf.length);

// 2. Generate for Dr. Elena Rostova
const elenaPdf = generateAbstractPdf({
  submission_id: 'BIOPOLYM-ABS-2026-460793',
  conference_title: '2nd World Congress on Biopolymers & Bioplastics',
  title: 'Enzymatic Polymerization of Renewable Polyhydroxyalkanoates',
  primary_author_name: 'Dr. Elena Rostova',
  primary_author_email: 'elena.rostova@oxford-biotech.ac.uk',
  primary_author_phone: '+44 7911 123456',
  primary_author_affiliation: 'Oxford Institute of Macromolecular Science',
  primary_author_country: 'United Kingdom',
  presentation_preference: 'Oral',
  research_domain: 'Biopolymers & Bioplastics',
  keywords: 'Biopolymers, Enzymes, Circular Economy, PHA',
  abstract_text: 'Comprehensive study demonstrating closed-loop recycling and high-yield enzymatic polymerization under ambient atmospheric conditions with non-toxic catalytic enzymes.',
  created_at: '2026-10-11 12:51:29'
});

fs.writeFileSync('public/uploads/abstract_conf_1-elena-rostova.pdf', elenaPdf);
if (fs.existsSync('dist/uploads')) {
  fs.writeFileSync('dist/uploads/abstract_conf_1-elena-rostova.pdf', elenaPdf);
}
console.log('Elena Rostova PDF generated. Size:', elenaPdf.length);

// 3. Repair template_conf_2 files
const nanoPdf = generateAbstractPdf({
  submission_id: 'SAMPLE-NANO-TEMPLATE-2026',
  conference_title: 'International Congress on Nanomedicine & Targeted Drug Delivery',
  title: 'Sample Official Abstract Template — Nanomedicine & Drug Delivery 2026',
  primary_author_name: 'Corresponding Author Name',
  primary_author_email: 'author@academic-institution.org',
  primary_author_phone: '+1 (000) 000-0000',
  primary_author_affiliation: 'Department of Pharmaceutical Sciences, University',
  primary_author_country: 'United Kingdom',
  presentation_preference: 'Oral',
  research_domain: 'Targeted Drug Delivery',
  keywords: 'Nanoparticles, Oncology, Targeted Delivery, Liposomes',
  abstract_text: 'This is the official sample abstract formatting template for the International Congress on Nanomedicine & Targeted Drug Delivery. Authors should follow this layout: Introduction, Materials and Methods, Results, and Conclusions (maximum 350 words).',
  created_at: '2026-10-11 00:00:00'
});

fs.writeFileSync('public/uploads/template_conf_2-1791701891874-4924.pdf', nanoPdf);
fs.writeFileSync('public/uploads/template_conf_2-1791701980086-2146.pdf', nanoPdf);
if (fs.existsSync('dist/uploads')) {
  fs.writeFileSync('dist/uploads/template_conf_2-1791701891874-4924.pdf', nanoPdf);
  fs.writeFileSync('dist/uploads/template_conf_2-1791701980086-2146.pdf', nanoPdf);
}
console.log('Nanomedicine template PDFs healed. Size:', nanoPdf.length);

// 4. Update database/local_abstracts.json to ensure Elena Rostova has file_url and file_name populated
const abstractsFile = path.join(process.cwd(), 'database', 'local_abstracts.json');
if (fs.existsSync(abstractsFile)) {
  const abstracts = JSON.parse(fs.readFileSync(abstractsFile, 'utf8'));
  let updatedCount = 0;
  for (const abs of abstracts) {
    if (abs.id === 6 || abs.submission_id === 'BIOPOLYM-ABS-2026-460793') {
      abs.file_name = 'rostova_abstract_2026.pdf';
      abs.file_url = '/uploads/abstract_conf_1-elena-rostova.pdf';
      updatedCount++;
    }
  }
  if (updatedCount > 0) {
    fs.writeFileSync(abstractsFile, JSON.stringify(abstracts, null, 2), 'utf8');
    console.log('Updated local_abstracts.json for Elena Rostova with valid file_url');
  }
}

module.exports = { generateAbstractPdf };
