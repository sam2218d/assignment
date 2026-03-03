"use client";

import React, { useState, useRef } from 'react';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentPreview from '../components/AssignmentPreview';
import { StudentData } from '../types';
import { generatePDF } from '../utils/pdfUtils';
import { COLLEGE_CONFIG, COURSES, PROFESSORS } from '../config/collegeConfig';
import { FileText, Github } from 'lucide-react';

export default function Home() {
    const [formData, setFormData] = useState<StudentData>({
        studentName: '',
        studentId: '',
        tuRollNo: '',
        semester: '7th',
        courseTitle: COURSES[0].title,
        courseCode: COURSES[0].code,
        professorName: PROFESSORS[0].name,
        department: COLLEGE_CONFIG.department,
        collegeName: COLLEGE_CONFIG.name,
        submissionDate: new Date().toISOString().split('T')[0],
    });

    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        const savedData = localStorage.getItem('assignmentFormData');
        if (savedData) {
            try {
                setFormData(JSON.parse(savedData));
            } catch (e) {
                console.error("Error parsing saved assignment form data", e);
            }
        }
    }, []);

    const previewRef = useRef<HTMLDivElement>(null);

    const handleDataChange = (data: StudentData) => {
        setFormData(data);
        if (isMounted) {
            localStorage.setItem('assignmentFormData', JSON.stringify(data));
        }
    };

    const handleGeneratePDF = async () => {
        await generatePDF(formData, `${formData.studentName || 'assignment'}_front_page.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        // Reset logic is handled in AssignmentForm, but we can add extra logic here if needed
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md">
                            <img
                                src="/user_photo.png"
                                alt="User Photo"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                            Assignment Front Page Generator
                        </h1>
                        <h1 className="text-xl font-bold text-gray-900 sm:hidden">
                            Front Page Gen
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/sam2218d/assignment.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <Github className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Form */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 no-print">
                        <div className="sticky top-24">
                            <AssignmentForm
                                onDataChange={handleDataChange}
                                onGenerate={handleGeneratePDF}
                                onPrint={handlePrint}
                                onReset={handleReset}
                            />

                            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-semibold mb-1">Tip:</p>
                                <p>Fill in the details and click "Download PDF" to get your print-ready front page. The preview updates automatically.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="w-full lg:w-2/3 xl:w-3/4 flex justify-center">
                        <div className="print-content">
                            <AssignmentPreview
                                ref={previewRef}
                                data={formData}
                            />
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-auto no-print">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Assignment Front Page Generator. Built with Next.js & Tailwind CSS.</p>
                </div>
            </footer>
        </>
    );
}
