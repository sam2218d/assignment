import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Assignment Front Page Generator',
    description: 'Generate A4 sized assignment front pages',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-gray-50 flex flex-col font-sans">
                {children}
            </body>
        </html>
    );
}
