import React, { useState, useRef } from 'react';
import AssignmentForm from './components/AssignmentForm';
import AssignmentPreview from './components/AssignmentPreview';
import { StudentData } from './types';
import { generatePDF } from './utils/pdfUtils';
import { COLLEGE_CONFIG, COURSES, PROFESSORS } from './config/collegeConfig';
import { FileText, Github } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState<StudentData>(() => {
    const savedData = localStorage.getItem('assignmentFormData');
    return savedData ? JSON.parse(savedData) : {
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
    };
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const handleDataChange = (data: StudentData) => {
    setFormData(data);
  };

  const handleGeneratePDF = () => {
    if (previewRef.current) {
      // We need to target the inner A4 div for PDF generation
      // The ref is attached to the A4 div in AssignmentPreview
      generatePDF(previewRef.current, `${formData.studentName || 'assignment'}_front_page.pdf`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    // Reset logic is handled in AssignmentForm, but we can add extra logic here if needed
    // For now, just ensure the state is updated via handleDataChange which is called by AssignmentForm
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
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
              href="https://github.com" 
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
          <p>© {new Date().getFullYear()} Assignment Front Page Generator. Built with React & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
