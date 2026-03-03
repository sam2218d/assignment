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
  { title: "Data Structures & Algorithms", code: "CSPC401" },
  { title: "Introduction to DBMS", code: "CSPC402" },
  { title: "Computer Networks", code: "CSPC403" },
  { title: "Software Engineering", code: "CSPC404" },
  { title: "Data Structures Lab", code: "CSPC405" },
  { title: "Introduction to DBMS Lab", code: "CSPC406" },
  { title: "Mobile Application Development", code: "CSPE407" },
  { title: "Object Oriented Programming Methodology", code: "CSPE407" },
  { title: "Multimedia Technologies", code: "CSPE407" },
  { title: "Professional Skill Development", code: "HS408" },
  { title: "Mini Project", code: "CSPR409" },
  { title: "Essence of Indian Knowledge and Tradition", code: "AU401" },
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
