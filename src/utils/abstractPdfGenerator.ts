/**
 * SCINS MEDIA - Official Abstract PDF Generator
 * Generates standards-compliant, publication-ready PDF 1.4 documents for submitted abstracts.
 */

export interface AbstractPdfData {
  submission_id?: string;
  conference_title?: string;
  title?: string;
  primary_author_name?: string;
  primary_author_email?: string;
  primary_author_phone?: string;
  primary_author_affiliation?: string;
  primary_author_country?: string;
  presentation_preference?: string;
  research_domain?: string;
  keywords?: string;
  abstract_text?: string;
  created_at?: string;
}

export function generateAbstractPdf(data: AbstractPdfData): Buffer {
  const sanitize = (str: string | undefined): string => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[\r\n]+/g, ' ')
      .trim();
  };

  const wrapText = (text: string, maxCharsPerLine: number = 78): string[] => {
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines: string[] = [];
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

  // Build PDF Content Stream operators
  const commands: string[] = [];

  // Top header background decorative band
  commands.push('q');
  commands.push('0.06 0.15 0.25 rg'); // Dark navy (#0f2740)
  commands.push('40 735 532 35 re f');
  commands.push('Q');

  // Header Text
  commands.push('BT');
  commands.push('/F2 13 Tf');
  commands.push('1 1 1 rg'); // White
  commands.push('55 748 Td');
  commands.push(`(${sanitize('SCINS MEDIA — OFFICIAL SCIENTIFIC PROCEEDINGS')}) Tj`);
  commands.push('ET');

  // Conference & Submission ID Bar
  commands.push('BT');
  commands.push('/F2 9 Tf');
  commands.push('0.06 0.46 0.43 rg'); // Teal
  commands.push('50 710 Td');
  const confTitle = sanitize(data.conference_title || 'International Scientific Congress 2026');
  commands.push(`(${confTitle.substring(0, 75)}) Tj`);
  commands.push('/F1 8 Tf');
  commands.push('0.3 0.3 0.3 rg');
  commands.push('0 -14 Td');
  const refId = data.submission_id || 'SCINS-ABS-PENDING';
  const subDate = data.created_at ? ` | Submitted: ${data.created_at.substring(0, 16)}` : '';
  commands.push(`(${sanitize(`Submission Ref: ${refId}${subDate}`)}) Tj`);
  commands.push('ET');

  // Separator Line
  commands.push('q');
  commands.push('0.8 0.8 0.8 RG');
  commands.push('1 w');
  commands.push('50 682 m 572 682 l S');
  commands.push('Q');

  let currentY = 660;

  // Abstract Title
  commands.push('BT');
  commands.push('/F2 13 Tf');
  commands.push('0.1 0.1 0.1 rg');
  commands.push(`50 ${currentY} Td`);

  const titleLines = wrapText(data.title || 'Scientific Research Abstract', 60);
  for (let i = 0; i < titleLines.length; i++) {
    if (i > 0) {
      commands.push('0 -16 Td');
      currentY -= 16;
    }
    commands.push(`(${sanitize(titleLines[i])}) Tj`);
  }
  commands.push('ET');
  currentY -= 26;

  // Author & Institution Box
  commands.push('q');
  commands.push('0.96 0.97 0.98 rg'); // Light slate fill
  commands.push(`50 ${currentY - 60} 522 72 re f`);
  commands.push('0.88 0.9 0.92 RG');
  commands.push('1 w');
  commands.push(`50 ${currentY - 60} 522 72 re S`);
  commands.push('Q');

  // Author details text inside box
  commands.push('BT');
  commands.push('/F2 10 Tf');
  commands.push('0.06 0.15 0.25 rg');
  commands.push(`62 ${currentY - 5} Td`);
  const authorName = data.primary_author_name || 'Primary Author';
  commands.push(`(${sanitize(authorName)}) Tj`);

  commands.push('/F1 9 Tf');
  commands.push('0.25 0.3 0.35 rg');
  commands.push('0 -14 Td');
  const affil = data.primary_author_affiliation || 'Independent Scientific Researcher';
  const country = data.primary_author_country ? `, ${data.primary_author_country}` : '';
  commands.push(`(${sanitize(`${affil}${country}`)}) Tj`);

  commands.push('0 -13 Td');
  const contactParts: string[] = [];
  if (data.primary_author_email) contactParts.push(`Email: ${data.primary_author_email}`);
  if (data.primary_author_phone) contactParts.push(`Tel: ${data.primary_author_phone}`);
  commands.push(`(${sanitize(contactParts.join('  |  '))}) Tj`);

  commands.push('0 -13 Td');
  const formatStr = `Presentation Preference: ${data.presentation_preference || 'Oral'} Presentation`;
  const domainStr = data.research_domain ? `  |  Domain: ${data.research_domain}` : '';
  commands.push(`(${sanitize(`${formatStr}${domainStr}`)}) Tj`);
  commands.push('ET');

  currentY -= 82;

  // Section Heading: Abstract
  commands.push('BT');
  commands.push('/F2 11 Tf');
  commands.push('0.06 0.46 0.43 rg');
  commands.push(`50 ${currentY} Td`);
  commands.push(`(${sanitize('ABSTRACT')}) Tj`);
  commands.push('ET');
  currentY -= 16;

  // Abstract Body Text
  const bodyText = data.abstract_text || 'Original scientific research abstract document submitted for peer evaluation and conference proceedings inclusion.';
  const bodyLines = wrapText(bodyText, 76);

  commands.push('BT');
  commands.push('/F1 9.5 Tf');
  commands.push('0.15 0.15 0.15 rg');
  commands.push(`50 ${currentY} Td`);

  for (let i = 0; i < bodyLines.length; i++) {
    if (currentY < 100) break; // keep within page
    if (i > 0) {
      commands.push('0 -14 Td');
      currentY -= 14;
    }
    commands.push(`(${sanitize(bodyLines[i])}) Tj`);
  }
  commands.push('ET');
  currentY -= 24;

  // Keywords if present
  if (data.keywords && currentY > 90) {
    commands.push('BT');
    commands.push('/F2 9 Tf');
    commands.push('0.2 0.2 0.2 rg');
    commands.push(`50 ${currentY} Td`);
    commands.push(`(${sanitize(`Keywords: ${data.keywords}`)}) Tj`);
    commands.push('ET');
  }

  // Footer separator and metadata
  commands.push('q');
  commands.push('0.85 0.85 0.85 RG');
  commands.push('1 w');
  commands.push('50 50 m 572 50 l S');
  commands.push('Q');

  commands.push('BT');
  commands.push('/F1 7.5 Tf');
  commands.push('0.5 0.5 0.5 rg');
  commands.push('50 38 Td');
  commands.push(`(${sanitize('SCINS MEDIA Academic Conferences & Scientific Publishing — Confidential Peer Review Copy')}) Tj`);
  commands.push('440 0 Td');
  commands.push(`(${sanitize(`Page 1 of 1`)}) Tj`);
  commands.push('ET');

  const contentStream = commands.join('\n');
  const streamLength = Buffer.byteLength(contentStream, 'utf8');

  // Assembly of standard PDF 1.4 document
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [];

  const addObj = (objStr: string) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += objStr + '\n';
  };

  // Object 1: Catalog
  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');

  // Object 2: Pages
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');

  // Object 3: Page (Letter / A4 size: 612 x 792)
  addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>\nendobj');

  // Object 4: Stream
  addObj(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj`);

  // Object 5: Standard Helvetica font
  addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj');

  // Object 6: Standard Helvetica-Bold font
  addObj('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj');

  const startxref = Buffer.byteLength(pdf, 'utf8');
  pdf += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}
