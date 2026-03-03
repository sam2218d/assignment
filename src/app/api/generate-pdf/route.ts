import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';
import { COLLEGE_CONFIG } from '../../../config/collegeConfig';

export const dynamic = 'force-dynamic';

// A4 dimensions in points (1 pt = 1/72 inch)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56.69; // ~20mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ── helpers ────────────────────────────────────────────────────────────────

function centerText(
    page: PDFPage,
    text: string,
    font: PDFFont,
    size: number,
    y: number,
    color = rgb(0, 0, 0)
) {
    const width = font.widthOfTextAtSize(text, size);
    const x = (PAGE_WIDTH - width) / 2;
    page.drawText(text, { x, y, size, font, color });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, size) <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    return lines;
}

// Draw centered, word-wrapped text. Returns the y cursor after drawing.
function centerTextWrapped(
    page: PDFPage,
    text: string,
    font: PDFFont,
    size: number,
    y: number,
    lineHeight: number,
    maxWidth = CONTENT_WIDTH,
    color = rgb(0, 0, 0)
): number {
    const lines = wrapText(text, font, size, maxWidth);
    for (const line of lines) {
        centerText(page, line, font, size, y, color);
        y -= lineHeight;
    }
    return y;
}

function formatDate(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

// ── route ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

        // Embed standard fonts (no download, built into pdf-lib)
        const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

        const black = rgb(0, 0, 0);
        const darkGray = rgb(0.1, 0.1, 0.1);

        // ── layout cursor (starts near top, moves downward) ──
        let y = PAGE_HEIGHT - MARGIN - 14;

        // ── 1. "Assignment" label ──────────────────────────────
        centerText(page, 'Assignment', fontBold, 12, y, darkGray);
        y -= 28;

        // ── 2. Horizontal rule ────────────────────────────────
        page.drawLine({
            start: { x: MARGIN, y },
            end: { x: PAGE_WIDTH - MARGIN, y },
            thickness: 0.75,
            color: darkGray,
        });
        y -= 20;

        // ── 3. College name ───────────────────────────────────
        const collegeName: string = data.collegeName || COLLEGE_CONFIG.name;
        y = centerTextWrapped(page, collegeName.toUpperCase(), fontBold, 16, y, 22);
        y -= 8;

        // ── 4. Course Title ───────────────────────────────────
        const courseTitle: string = data.courseTitle || '';
        y = centerTextWrapped(
            page,
            `Course Title: ${courseTitle}`,
            fontRegular,
            11,
            y,
            17
        );
        y -= 4;

        // ── 5. Course Code ────────────────────────────────────
        const courseCode: string = data.courseCode || '';
        centerText(page, `Course Code: ${courseCode}`, fontRegular, 11, y, black);
        y -= 26;

        // ── 6. Horizontal rule ────────────────────────────────
        page.drawLine({
            start: { x: MARGIN, y },
            end: { x: PAGE_WIDTH - MARGIN, y },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5),
        });
        y -= 24;

        // ── 7. Logo image ─────────────────────────────────────
        const logoSize = 90; // pts (~32mm)
        let logoEmbedded = false;

        try {
            const origin = new URL(req.url).origin;
            let logoSrc: string = data.logoUrl || COLLEGE_CONFIG.logoUrl;

            if (logoSrc === '/logo.png' || logoSrc.startsWith('/')) {
                logoSrc = `${origin}${logoSrc}`;
            }

            const logoRes = await fetch(logoSrc);
            if (logoRes.ok) {
                const logoBuffer = await logoRes.arrayBuffer();
                const contentType = logoRes.headers.get('content-type') || '';

                let logoImage;
                if (contentType.includes('png') || logoSrc.toLowerCase().endsWith('.png')) {
                    logoImage = await pdfDoc.embedPng(logoBuffer);
                } else {
                    logoImage = await pdfDoc.embedJpg(logoBuffer);
                }

                const logoDims = logoImage.scaleToFit(logoSize, logoSize);
                const logoX = (PAGE_WIDTH - logoDims.width) / 2;
                const logoY = y - logoDims.height;
                page.drawImage(logoImage, {
                    x: logoX,
                    y: logoY,
                    width: logoDims.width,
                    height: logoDims.height,
                });
                y = logoY - 18;
                logoEmbedded = true;
            }
        } catch {
            // Logo fetch failed — skip gracefully
        }

        if (!logoEmbedded) {
            // Draw a placeholder circle if logo couldn't be loaded
            const cx = PAGE_WIDTH / 2;
            const cy = y - logoSize / 2;
            page.drawCircle({ x: cx, y: cy, size: logoSize / 2, borderColor: darkGray, borderWidth: 1 });
            centerText(page, 'LOGO', fontRegular, 10, cy - 4, darkGray);
            y = cy - logoSize / 2 - 18;
        }

        // ── 8. Address ────────────────────────────────────────
        const address: string = data.address || COLLEGE_CONFIG.address;
        y = centerTextWrapped(
            page,
            address.toUpperCase(),
            fontBold,
            10,
            y,
            15
        );
        y -= 26;

        // ── 9. Divider ────────────────────────────────────────
        page.drawLine({
            start: { x: MARGIN, y },
            end: { x: PAGE_WIDTH - MARGIN, y },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5),
        });
        y -= 24;

        // ── 10. Submitted To ──────────────────────────────────
        centerText(page, 'Submitted to', fontBold, 12, y, black);
        // Underline
        const toLabel = 'Submitted to';
        const toLabelW = fontBold.widthOfTextAtSize(toLabel, 12);
        const toLabelX = (PAGE_WIDTH - toLabelW) / 2;
        page.drawLine({
            start: { x: toLabelX, y: y - 1 },
            end: { x: toLabelX + toLabelW, y: y - 1 },
            thickness: 0.75,
            color: black,
        });
        y -= 18;

        const professorName: string = data.professorName || '';
        centerText(page, professorName, fontBold, 11, y, black);
        y -= 16;

        const professorDesignation: string = data.professorDesignation || 'Assistant Professor';
        centerText(page, professorDesignation, fontItalic, 11, y, darkGray);
        y -= 16;

        const department: string = data.department || COLLEGE_CONFIG.department;
        y = centerTextWrapped(page, department, fontBold, 11, y, 16);
        y = centerTextWrapped(page, collegeName, fontBold, 11, y, 16);
        y -= 28;

        // ── 11. Divider ───────────────────────────────────────
        page.drawLine({
            start: { x: MARGIN, y },
            end: { x: PAGE_WIDTH - MARGIN, y },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5),
        });
        y -= 24;

        // ── 12. Submitted By ──────────────────────────────────
        centerText(page, 'Submitted by', fontBold, 12, y, black);
        // Underline
        const byLabel = 'Submitted by';
        const byLabelW = fontBold.widthOfTextAtSize(byLabel, 12);
        const byLabelX = (PAGE_WIDTH - byLabelW) / 2;
        page.drawLine({
            start: { x: byLabelX, y: y - 1 },
            end: { x: byLabelX + byLabelW, y: y - 1 },
            thickness: 0.75,
            color: black,
        });
        y -= 18;

        const studentName: string = data.studentName || '';
        centerText(page, studentName, fontBold, 12, y, black);
        y -= 20;

        const studentId: string = data.studentId || '';
        centerText(page, `Student ID.: ${studentId}`, fontRegular, 11, y, black);
        y -= 16;

        const tuRollNo: string = data.tuRollNo || '';
        centerText(page, `TU Roll No.: ${tuRollNo}`, fontRegular, 11, y, black);
        y -= 16;

        const semester: string = data.semester || '';
        centerText(page, `Semester: ${semester}`, fontRegular, 11, y, black);
        y -= 20;

        y = centerTextWrapped(page, department, fontBold, 11, y, 16);
        y = centerTextWrapped(page, collegeName, fontBold, 11, y, 16);

        // ── 13. Date of Submission (pinned toward bottom) ─────
        const dateY = MARGIN + 36;
        page.drawLine({
            start: { x: MARGIN, y: dateY + 20 },
            end: { x: PAGE_WIDTH - MARGIN, y: dateY + 20 },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5),
        });

        const submissionDate: string = formatDate(data.submissionDate);
        centerText(
            page,
            `Date of Submission - ${submissionDate}`,
            fontBold,
            11,
            dateY,
            black
        );

        // ── Serialize ─────────────────────────────────────────
        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="assignment_front_page.pdf"',
                'Cache-Control': 'no-store',
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
