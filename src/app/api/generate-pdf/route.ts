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

        // ── layout cursor: y starts at top content edge, moves down ──
        // In pdf-lib, y=0 is bottom of page. We draw baseline at y.
        let y = PAGE_HEIGHT - MARGIN - 15; // first font baseline (15pt = text-xl)

        // ── 1. Assignment label — text-xl font-bold = 15pt, gap mb-6 = 18pt ──
        const assignmentLabel: string = data.assignmentNumber || 'Assignment';
        centerText(page, assignmentLabel, fontBold, 15, y, darkGray);
        y -= (15 + 18); // font + mb-6

        // ── 2. College name — text-3xl font-bold = 22pt, gap mb-8 = 24pt ──
        const collegeName: string = data.collegeName || COLLEGE_CONFIG.name;
        y = centerTextWrapped(page, collegeName.toUpperCase(), fontBold, 22, y, 28); // 28 = 22pt + 6pt leading
        y -= 24; // mb-8

        // ── 3. Course info — text-lg = 13pt, space-y-3 = 9pt between, mb-8 = 24pt ──
        const courseTitle: string = data.courseTitle || '';
        y = centerTextWrapped(page, `Course Title: ${courseTitle}`, fontBold, 13, y, 19);
        y -= 9; // space-y-3
        const courseCode: string = data.courseCode || '';
        centerText(page, `Course Code: ${courseCode}`, fontBold, 13, y, black);
        y -= (13 + 24); // font + mb-8

        // ── 4. Logo — w-32 h-32 = 96pt, mb-8 = 24pt ──
        const logoSize = 96;
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
                y = logoY - 24; // mb-8
                logoEmbedded = true;
            }
        } catch {
            // Logo fetch failed — skip gracefully
        }

        if (!logoEmbedded) {
            const cx = PAGE_WIDTH / 2;
            const cy = y - logoSize / 2;
            page.drawCircle({ x: cx, y: cy, size: logoSize / 2, borderColor: darkGray, borderWidth: 1 });
            centerText(page, 'LOGO', fontRegular, 10, cy - 4, darkGray);
            y = cy - logoSize / 2 - 24; // mb-8
        }

        // ── 5. Address — text-lg font-bold uppercase = 13pt, mb-12 = 36pt ──
        const address: string = data.address || COLLEGE_CONFIG.address;
        y = centerTextWrapped(page, address.toUpperCase(), fontBold, 13, y, 19);
        y -= 36; // mb-12

        // ── 6. Submitted to — text-lg font-bold = 13pt + underline, mb-2 = 6pt ──
        const toLabel = 'Submitted to';
        centerText(page, toLabel, fontBold, 13, y, black);
        const toLabelW = fontBold.widthOfTextAtSize(toLabel, 13);
        page.drawLine({
            start: { x: (PAGE_WIDTH - toLabelW) / 2, y: y - 1.5 },
            end: { x: (PAGE_WIDTH + toLabelW) / 2, y: y - 1.5 },
            thickness: 0.6,
            color: black,
        });
        y -= (13 + 6); // font + mb-2

        const professorName: string = data.professorName || '';
        centerText(page, professorName, fontBold, 13, y, black);
        y -= (13 + 2); // font + small gap

        const professorDesignation: string = data.professorDesignation || 'Assistant Professor';
        centerText(page, professorDesignation, fontItalic, 12, y, darkGray);
        y -= (12 + 12); // font + mb-4

        const department: string = data.department || COLLEGE_CONFIG.department;
        // space-y-1 = 3pt between lines
        y = centerTextWrapped(page, department, fontBold, 12, y, 15);
        y = centerTextWrapped(page, collegeName, fontBold, 12, y, 15);
        y -= 36; // mb-12

        // ── 7. Submitted by — text-lg font-bold = 13pt + underline, mb-2 = 6pt ──
        const byLabel = 'Submitted by';
        centerText(page, byLabel, fontBold, 13, y, black);
        const byLabelW = fontBold.widthOfTextAtSize(byLabel, 13);
        page.drawLine({
            start: { x: (PAGE_WIDTH - byLabelW) / 2, y: y - 1.5 },
            end: { x: (PAGE_WIDTH + byLabelW) / 2, y: y - 1.5 },
            thickness: 0.6,
            color: black,
        });
        y -= (13 + 6); // font + mb-2

        const studentName: string = data.studentName || '';
        centerText(page, studentName, fontBold, 13, y, black);
        y -= (13 + 6); // font + mb-2

        // space-y-1 = 3pt between detail lines
        const studentId: string = data.studentId || '';
        centerText(page, `Student ID.: ${studentId}`, fontRegular, 12, y, black);
        y -= (12 + 3);

        const tuRollNo: string = data.tuRollNo || '';
        centerText(page, `TU Roll No.: ${tuRollNo}`, fontRegular, 12, y, black);
        y -= (12 + 3);

        const semester: string = data.semester || '';
        centerText(page, `Semester: ${semester}`, fontRegular, 12, y, black);
        y -= (12 + 12); // font + mb-4

        y = centerTextWrapped(page, department, fontBold, 12, y, 15);
        y = centerTextWrapped(page, collegeName, fontBold, 12, y, 15);

        // ── 8. Date — text-lg font-bold = 13pt, pinned to bottom (mt-auto) ──
        const dateY = MARGIN + 20;
        const submissionDate: string = formatDate(data.submissionDate);
        centerText(
            page,
            `Date of Submission - ${submissionDate}`,
            fontBold,
            13,
            dateY,
            black
        );


        // ── Serialize ─────────────────────────────────────────
        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        return new NextResponse(pdfBuffer, {
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
