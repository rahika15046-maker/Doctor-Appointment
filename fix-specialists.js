import { readFileSync, writeFileSync } from 'fs';

// Fix 1: OurDoctors.jsx — Remove unnecessary departments from filter
const doctorsPath = './client/src/components/OurDoctors.jsx';
let doctors = readFileSync(doctorsPath, 'utf8');

doctors = doctors.replace(
  /const departments = \[\r?\n\s+'All',\r?\n\s+'Cardiology',\r?\n\s+'Dermatology',\r?\n\s+'Neurology',\r?\n\s+'Orthopedics',\r?\n\s+'Pediatrics',\r?\n\s+'Gynecology',\r?\n\s+'Dentistry',\r?\n\s+'General Medicine',\r?\n\s+\];/,
  `const departments = [\n    'All',\n    'General Medicine',\n    'Cardiology',\n    'Orthopedics',\n    'Pediatrics',\n  ];`
);

writeFileSync(doctorsPath, doctors, 'utf8');
console.log('✅ OurDoctors.jsx — departments cleaned to 4 core specializations');

// Fix 2: AboutUsPage.jsx — Fix stat that claims "25+ Specialized Departments"
const aboutPath = './client/src/components/AboutUsPage.jsx';
let about = readFileSync(aboutPath, 'utf8');

about = about.replace(
  /\{ value: '25\+', label: 'Specialized Departments', desc: 'Cardiology, Neurology, Orthopedics, Pediatrics \& more' \}/,
  `{ value: '4', label: 'Clinical Departments', desc: 'General Medicine, Cardiology, Orthopedics & Pediatrics' }`
);

writeFileSync(aboutPath, about, 'utf8');
console.log('✅ AboutUsPage.jsx — stat corrected to 4 clinical departments');

// Verify
const docCheck = readFileSync(doctorsPath, 'utf8');
if (docCheck.includes('Dermatology') || docCheck.includes('Neurology') || docCheck.includes('Gynecology') || docCheck.includes('Dentistry')) {
  console.log('⚠️  OurDoctors still has unwanted specs!');
} else {
  console.log('✅ OurDoctors.jsx verified clean');
}

const aboutCheck = readFileSync(aboutPath, 'utf8');
if (aboutCheck.includes("'25+'")) {
  console.log('⚠️  AboutUsPage still has 25+ departments!');
} else {
  console.log('✅ AboutUsPage.jsx verified clean');
}
