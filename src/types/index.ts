export interface StudentData {
  studentName: string;
  studentId: string;
  tuRollNo: string;
  semester: string;
  courseTitle: string;
  courseCode: string;
  professorName: string;
  department: string;
  collegeName: string;
  submissionDate: string;
  assignmentNumber?: string;
}

export interface Course {
  title: string;
  code: string;
}

export interface Professor {
  name: string;
  designation: string;
}

export interface CollegeConfig {
  name: string;
  logoUrl: string;
  address: string;
  department: string;
}
