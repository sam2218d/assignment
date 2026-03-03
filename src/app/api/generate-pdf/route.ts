import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';
import { COLLEGE_CONFIG } from '../../../config/collegeConfig';

// Force Edge compatibility for Vercel
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Vercel / Local chromium launch setup
        const isLocal = process.env.NODE_ENV === 'development';

        let browser;
        if (isLocal) {
            const executablePath = process.platform === 'win32'
                ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                : process.platform === 'linux' ? '/usr/bin/google-chrome' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: executablePath,
                headless: true,
            });
        } else {
            // Vercel setup
            // Workaround for @sparticuz/chromium type errors
            const chrom: any = chromium;

            await chrom.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

            browser = await puppeteer.launch({
                args: chrom.args,
                defaultViewport: chrom.defaultViewport,
                executablePath: await chrom.executablePath(),
                headless: chrom.headless,
            });
        }

        const page = await browser.newPage();

        // Date formatter
        const formatDate = (dateString: string) => {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        };

        const origin = new URL(req.url).origin;
        let logoSrc = data.logoUrl || COLLEGE_CONFIG.logoUrl;

        if (logoSrc === '/logo.png') {
            logoSrc = `${origin}/logo.png`;
        } else if (!logoSrc) {
            logoSrc = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
        }

        const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assignment Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
            body { 
                font-family: 'Times New Roman', Times, serif; 
                background: white; 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .a4-container {
                width: 210mm;
                height: 297mm;  /* Strict height to prevent spilling to next page */
                padding: 15mm;   /* Slightly reduced padding to give more internal space */
                box-sizing: border-box;
                margin: 0 auto;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                overflow: hidden; /* Hide overflow to prevent 2nd page generation */
            }
        </style>
    </head>
    <body>
        <div class="a4-container">
            <!-- Header Section -->
            <div class="w-full flex-col flex items-center mb-6">
                <h1 class="text-xl font-bold mb-4 tracking-wide">Assignment</h1>
                
                <h2 class="text-3xl font-bold mb-6 tracking-wide text-gray-900" style="transform: scaleY(1.1); transform-origin: center;">
                    ${data.collegeName}
                </h2>
                
                <div class="space-y-2 mb-6 w-full">
                    <p class="text-lg">
                        <span class="font-bold">Course Title: </span>
                        ${data.courseTitle}
                    </p>
                    <p class="text-lg">
                        <span class="font-bold">Course Code: </span>
                        ${data.courseCode}
                    </p>
                </div>
            </div>

            <!-- Logo Section -->
            <div class="mb-6 flex justify-center items-center w-full">
                <div class="w-28 h-28 relative flex items-center justify-center">
                    <img 
                      src="${logoSrc}" 
                      alt="College Logo" 
                      class="w-full h-full object-contain"
                    />
                </div>
            </div>

            <!-- Location -->
            <div class="mb-8 w-full">
                <p class="text-lg font-bold uppercase tracking-wider">
                    ${data.address || 'MAHESHKHOLA, AGARTALA, TRIPURA'}
                </p>
            </div>

            <!-- Submitted To Section -->
            <div class="mb-10 w-full">
                <h3 class="text-lg font-bold mb-2 underline underline-offset-4 decoration-1">Submitted to</h3>
                <p class="text-lg font-bold">${data.professorName}</p>
                <p class="text-md italic mb-3">${data.professorDesignation || 'Assistant Professor'}</p>
                
                <div class="space-y-1">
                    <p class="font-bold">${data.department}</p>
                    <p class="font-bold">${data.collegeName}</p>
                </div>
            </div>

            <!-- Submitted By Section -->
            <div class="mb-10 w-full flex-grow">
                <h3 class="text-lg font-bold mb-2 underline underline-offset-4 decoration-1">Submitted by</h3>
                <p class="text-lg font-bold mb-2">${data.studentName}</p>
                
                <div class="space-y-1 mb-3">
                    <p>Student ID.: ${data.studentId}</p>
                    <p>TU Roll No.: ${data.tuRollNo}</p>
                    <p>Semester: ${data.semester}</p>
                </div>
                
                <div class="space-y-1">
                    <p class="font-bold">${data.department}</p>
                    <p class="font-bold">${data.collegeName}</p>
                </div>
            </div>

            <!-- Footer Date -->
            <div class="mt-auto w-full">
                <p class="text-lg font-bold">
                    Date of Submission - ${formatDate(data.submissionDate)}
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="assignment_front_page.pdf"',
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
