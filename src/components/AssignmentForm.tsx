import React, { useState, useEffect } from 'react';
import { StudentData, Course, Professor } from '../types';
import { COLLEGE_CONFIG, COURSES, PROFESSORS, SEMESTERS } from '../config/collegeConfig';
import { Calendar, User, BookOpen, GraduationCap, Building, Download, Printer, RotateCcw } from 'lucide-react';

interface AssignmentFormProps {
  onDataChange: (data: StudentData) => void;
  onGenerate: () => void;
  onPrint: () => void;
  onReset: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onDataChange, onGenerate, onPrint, onReset }) => {
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
    assignmentNumber: 'Assignment I',
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedData = localStorage.getItem('assignmentFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Error parsing saved form data', e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('assignmentFormData', JSON.stringify(formData));
    }
    onDataChange(formData);
  }, [formData, onDataChange, mounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'courseTitle') {
      const selectedCourse = COURSES.find(c => c.title === value);
      setFormData(prev => ({
        ...prev,
        courseTitle: value,
        courseCode: selectedCourse ? selectedCourse.code : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    const defaultData = {
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
      assignmentNumber: 'Assignment I',
    };
    setFormData(defaultData);
    localStorage.removeItem('assignmentFormData');
    onReset();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-indigo-600" />
        Assignment Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Student Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="2230401071"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TU Roll No.</label>
            <input
              type="text"
              name="tuRollNo"
              value={formData.tuRollNo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="22670414326704143"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {SEMESTERS.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Course Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Number</label>
            <select
              name="assignmentNumber"
              value={formData.assignmentNumber || 'Assignment I'}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {['Assignment I', 'Assignment II', 'Assignment III', 'Assignment IV', 'Assignment V'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
            <select
              name="courseTitle"
              value={formData.courseTitle}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {COURSES.map(course => (
                <option key={course.code} value={course.title}>{course.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              readOnly
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professor Name</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                name="professorName"
                value={formData.professorName}
                onChange={handleChange}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {PROFESSORS.map(prof => (
                  <option key={prof.name} value={prof.name}>{prof.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Submission</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleChange}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>



      <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:justify-end">
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full sm:w-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={onPrint}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={onGenerate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default AssignmentForm;
