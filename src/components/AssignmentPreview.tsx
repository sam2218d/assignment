import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { StudentData, Professor } from '../types';
import { COLLEGE_CONFIG, DEFAULT_LOGO, PROFESSORS } from '../config/collegeConfig';

interface AssignmentPreviewProps {
  data: StudentData;
}

// A4 width in px at 96 dpi: 210mm × (96/25.4) ≈ 794 px
const A4_PX = 794;

const AssignmentPreview = forwardRef<HTMLDivElement, AssignmentPreviewProps>(({ data }, ref) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const professor = PROFESSORS.find(p => p.name === data.professorName);
  const professorDesignation = professor ? professor.designation : 'Assistant Professor';

  // ── Responsive scaling ──────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      // Available width = container width minus horizontal padding (16px each side)
      const available = containerRef.current.offsetWidth - 32;
      setScale(Math.min(1, available / A4_PX));
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // When scale < 1 the element still occupies its full 297mm in layout.
  // Negative margin-bottom collapses that extra blank space.
  const marginBottom = scale < 1 ? `calc((${scale} - 1) * 297mm)` : undefined;

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-100 p-4 md:p-8 flex justify-center overflow-hidden"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          display: 'inline-block',
          marginBottom,
        }}
      >
        <div
          ref={ref}
          className="bg-white shadow-lg relative flex flex-col items-center text-center"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            boxSizing: 'border-box',
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000',
          }}
        >
          {/* Header */}
          <div className="w-full flex flex-col items-center mb-8">
            <h1 className="text-xl font-bold mb-6 tracking-wide">
              {data.assignmentNumber || 'Assignment'}
            </h1>

            <h2 className="text-3xl font-bold mb-8 tracking-wide text-gray-900 scale-y-110 transform origin-center">
              {data.collegeName}
            </h2>

            <div className="space-y-3 mb-8 w-full">
              <p className="text-lg">
                <span className="font-bold">Course Title: </span>
                {data.courseTitle}
              </p>
              <p className="text-lg">
                <span className="font-bold">Course Code: </span>
                {data.courseCode}
              </p>
            </div>
          </div>

          {/* Logo */}
          <div className="mb-8 flex justify-center items-center w-full">
            <div className="w-32 h-32 relative flex items-center justify-center">
              <img
                src={COLLEGE_CONFIG.logoUrl || DEFAULT_LOGO}
                alt="College Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-12 w-full">
            <p className="text-lg font-bold uppercase tracking-wider">
              {COLLEGE_CONFIG.address}
            </p>
          </div>

          {/* Submitted To */}
          <div className="mb-12 w-full">
            <h3 className="text-lg font-bold mb-2 underline underline-offset-4 decoration-1">
              Submitted to
            </h3>
            <p className="text-lg font-bold">{data.professorName}</p>
            <p className="text-md italic mb-4">{professorDesignation}</p>
            <div className="space-y-1">
              <p className="font-bold">{data.department}</p>
              <p className="font-bold">{data.collegeName}</p>
            </div>
          </div>

          {/* Submitted By */}
          <div className="mb-16 w-full flex-grow">
            <h3 className="text-lg font-bold mb-2 underline underline-offset-4 decoration-1">
              Submitted by
            </h3>
            <p className="text-lg font-bold mb-2">{data.studentName}</p>
            <div className="space-y-1 mb-4">
              <p>Student ID.: {data.studentId}</p>
              <p>TU Roll No.: {data.tuRollNo}</p>
              <p>Semester: {data.semester}</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold">{data.department}</p>
              <p className="font-bold">{data.collegeName}</p>
            </div>
          </div>

          {/* Date */}
          <div className="mt-auto w-full pt-8">
            <p className="text-lg font-bold">
              Date of Submission - {formatDate(data.submissionDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

AssignmentPreview.displayName = 'AssignmentPreview';

export default AssignmentPreview;
