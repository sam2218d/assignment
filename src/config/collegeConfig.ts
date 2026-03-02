import { CollegeConfig, Course, Professor } from '../types';

export const COLLEGE_CONFIG: CollegeConfig = {
  name: "Techno College of Engineering Agartala",
  logoUrl: "/logo.png",
  address: "MAHESHKHOLA, AGARTALA, TRIPURA",
  department: "Department of Computer Science & Engineering"
};

// Using a generic red logo placeholder since the user provided an image with a red logo.
// Ideally, we'd use the actual logo if available online, but for now a placeholder is safer.
export const DEFAULT_LOGO = "https://ui-avatars.com/api/?name=T+C+E+A&background=ef4444&color=fff&size=256&font-size=0.33&rounded=true&bold=true";

export const COURSES: Course[] = [
  { title: "Kotlin Programming", code: "PE CS 701/2" },
  { title: "Compiler Design", code: "PCC-CS-601" },
  { title: "Computer Networks", code: "PCC-CS-602" },
  { title: "Operating Systems", code: "PCC-CS-502" },
  { title: "Database Management Systems", code: "PCC-CS-503" },
  { title: "Artificial Intelligence", code: "PEC-CS-701" },
  { title: "Machine Learning", code: "PEC-CS-702" },
  { title: "Software Engineering", code: "PCC-CS-501" },
];

export const PROFESSORS: Professor[] = [
  { name: "Mr. Sankha Subhra Debnath", designation: "Assistant Professor" },
  { name: "Dr. John Doe", designation: "Associate Professor" },
  { name: "Ms. Jane Smith", designation: "Assistant Professor" },
  { name: "Dr. Alan Turing", designation: "Professor" },
  { name: "Mrs. Ada Lovelace", designation: "Associate Professor" },
  { name: "Mr. Charles Babbage", designation: "Assistant Professor" },
  { name: "Dr. Grace Hopper", designation: "Professor" },
];

export const SEMESTERS = [
  "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
];
