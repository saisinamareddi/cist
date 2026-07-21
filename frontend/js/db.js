// CIST Portal Student Database & Mock Records

const rawStudentList = [
  { "FullName": "K Lavanya", "Roll_Number": "23S01A0526", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Mamidi Rama Lakshmi", "Roll_Number": "23S01A0538", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Mounika Keerthi", "Roll_Number": "23S01A0530", "Branch": "Computer science and engineering" },
  { "FullName": "K.Sharuni rani", "Roll_Number": "23S01A0531", "Branch": "Computer science and engineering" },
  { "FullName": "Parvathi Bodakurthi", "Roll_Number": "23S01A0504", "Branch": "Computer Science And Engineering" },
  { "FullName": "Thiparala pushpa", "Roll_Number": "23S01A0565", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Sandhya vemagiri", "Roll_Number": "23S01A0570", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Harika Geddam", "Roll_Number": "23S01A0519", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Palivela vijaya", "Roll_Number": "23S01A0547", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Sailaja undrasapu", "Roll_Number": "23S01A0566", "Branch": "Computer science and engineering" },
  { "FullName": "Papa undurthi", "Roll_Number": "23S01A0567", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "PARVATHI BODAKURTHI", "Roll_Number": "23S01A0504", "Branch": "COMPUTER SCIENCE AND ENGINEERING" },
  { "FullName": "Bandhili Deepika", "Roll_Number": "23S01A0501", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Oleti syamala", "Roll_Number": "23S01A0545", "Branch": "Computer science and engineering" },
  { "FullName": "Sahithi chitrapu", "Roll_Number": "23SO1A0513", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "S Sri sowkya chandrika", "Roll_Number": "23S01A0561", "Branch": "Computer science and engineering" },
  { "FullName": "Pyla saiganesh", "Roll_Number": "23S01A0554", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Aswini bojjapu", "Roll_Number": "23S01A0506", "Branch": "COMPUTER SCIENCE AND ENGINEERING" },
  { "FullName": "Kudupudi Tejaswani", "Roll_Number": "23S01A0534", "Branch": "Computer science and engineering" },
  { "FullName": "G.uma Maheshwar rao", "Roll_Number": "23S01A0517", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Gonnuri NavyaSri", "Roll_Number": "23S01A0525", "Branch": "Computer science and engineering" },
  { "FullName": "Gondesi Tejesh Reddy", "Roll_Number": "23S01A0574", "Branch": "Computer science and engineering" },
  { "FullName": "Uba salomi priyanka", "Roll_Number": "23S01A0598", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Thakasi Balaji", "Roll_Number": "23S01A0564", "Branch": "Computer science and engineering" },
  { "FullName": "BOLISETTI  DURGA BHAVANI", "Roll_Number": "23S01A0507", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Sesharathnam Nethala", "Roll_Number": "23S01A0544", "Branch": "Computer science and engineering" },
  { "FullName": "Bodapati suvarna", "Roll_Number": "23S01A0505", "Branch": "Computer science engineering" },
  { "FullName": "Kuvvala Raju", "Roll_Number": "23S01A0535", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Tejaswini Palla", "Roll_Number": "23S01A0548", "Branch": "Computer Science and Engineering" },
  { "FullName": "Sumanth", "Roll_Number": "23S01A0520", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Vellanki kavya sri satya sai", "Roll_Number": "25S05A0501", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Kale Sai Praneeth", "Roll_Number": "23S01A0586", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Ganesh pandava", "Roll_Number": "23S01A0549", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Kattumuri Manideep", "Roll_Number": "23S01A0529", "Branch": "Computer science and engineering" },
  { "FullName": "P. Narendra", "Roll_Number": "23S01A0592", "Branch": "Computer science & Engineering" },
  { "FullName": "P. Narendra", "Roll_Number": "23S01A0592", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Gonnuri NavyaSri", "Roll_Number": "23S01A0525", "Branch": "Computer science and engineering" },
  { "FullName": "Ryali Dhatri Siddi Venkata Lakshmi", "Roll_Number": "23S01A0579", "Branch": "Computer Science and Engineering" },
  { "FullName": "Girijala Madhurima", "Roll_Number": "24SO1A0522", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Nethala chandini", "Roll_Number": "23S01A0543", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Pulapakoru Himabindu", "Roll_Number": "23S01A0553", "Branch": "Computer Science and Engineering" },
  { "FullName": "Koppula Gowtham kumar", "Roll_Number": "23S01A0533", "Branch": "Computer science and engineering" },
  { "FullName": "Tejaswini Palla", "Roll_Number": "23S01A0548", "Branch": "Computer Science and Engineering" },
  { "FullName": "Devika bedhampudi", "Roll_Number": "23S01A0502", "Branch": "Computer science engineering" },
  { "FullName": "Surya Tejas", "Roll_Number": "23S01A0509", "Branch": "Computer science and engineering" },
  { "FullName": "Divyalanka", "Roll_Number": "23S01A0536", "Branch": "Computer science and engineering" },
  { "FullName": "Srimanthula Akhila", "Roll_Number": "23S01A0560", "Branch": "Computer science and engineering" },
  { "FullName": "Bonasu Govindu", "Roll_Number": "23S01A0508", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Peyyela Bhanu Rekha", "Roll_Number": "23S01A0552", "Branch": "Computer science and engineering" },
  { "FullName": "Mounika Kumche", "Roll_Number": "23S01A0583", "Branch": "Computer science and Engineering" },
  { "FullName": "Beera surekha", "Roll_Number": "23S01A0503", "Branch": "Computer science and engineering" },
  { "FullName": "Gollepalli Nageswari", "Roll_Number": "23S01A0523", "Branch": "Computer science engineering" },
  { "FullName": "G.vinya sri", "Roll_Number": "23S01A0518", "Branch": "Computer science engineering" },
  { "FullName": "G.vinya sri", "Roll_Number": "23S01A0518", "Branch": "Computer science engineering" },
  { "FullName": "Peetha Hima krishna Satya sri", "Roll_Number": "23S01A0550", "Branch": "Computer science and engineering" },
  { "FullName": "Dondapati prameela", "Roll_Number": "23S01A0515", "Branch": "Computer science and engineering" },
  { "FullName": "Meghana Danimireddi", "Roll_Number": "23S01A0514", "Branch": "Computer science and engineering" },
  { "FullName": "ANITHA BONDU", "Roll_Number": "23S01A5407", "Branch": "Artificial intelligence and data science" },
  { "FullName": "Tejasri gonela", "Roll_Number": "23S01A0524", "Branch": "Computer science and engineering" },
  { "FullName": "P.Chandu", "Roll_Number": "24S05A0505", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Malli Satti Bharath", "Roll_Number": "24S05A0504", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "R varshini", "Roll_Number": "23S01A0590", "Branch": "Computer science and engineering" },
  { "FullName": "SAYILA RAHUL KUMAR", "Roll_Number": "23S01A0558", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "S. Siswa", "Roll_Number": "23S01A0559", "Branch": "Computer science and engineering" },
  { "FullName": "SUNTRU VISWA REDDY", "Roll_Number": "23S01A0562", "Branch": "Computer science and engineering" },
  { "FullName": "Nakka Kusuma", "Roll_Number": "23S01A0591", "Branch": "Computer science and engineering" },
  { "FullName": "Manju pulapakura", "Roll_Number": "23S01A5410", "Branch": "Artificial intelligence and data science" },
  { "FullName": "Muppidi madhuri", "Roll_Number": "23S01A0540", "Branch": "Computer science and engineering" },
  { "FullName": "Mounika Sanapathi", "Roll_Number": "23S01A0556", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "S.Pravallika", "Roll_Number": "23S01A0555", "Branch": "Computer science and engineering" },
  { "FullName": "Palepu Dhana Kumari", "Roll_Number": "23S01A0546", "Branch": "COMPUTER SCIENCE AND TECHNOLOGY" },
  { "FullName": "Thutta Bhavani Anusha", "Roll_Number": "23S01A0580", "Branch": "Computer science and engineering" },
  { "FullName": "Kundrapu chetana", "Roll_Number": "23S01A0589", "Branch": "Computer science and engineering" },
  { "FullName": "Kamidi.Durga Bhavani", "Roll_Number": "23S01A0527", "Branch": "Computer science and engineering" },
  { "FullName": "Geddam Swathi", "Roll_Number": "23S01A0521", "Branch": "Computer science and engineering" },
  { "FullName": "Peetha Hima krishna Satya sri", "Roll_Number": "23S01A0550", "Branch": "Computer science and engineering" },
  { "FullName": "Sai Sinamareddi", "Roll_Number": "24S05A5403", "Branch": "Artificial Intelligence and Data Science", "section": "A", "year": 3, "semester": "3-1", "academicYear": "2024-2028" },
  { "FullName": "Iskapati Reshma", "Roll_Number": "24S01A0528", "Branch": "Computer Science and Engineering", "section": "A", "year": 3, "semester": "3-1", "academicYear": "2024-2028" }
];

const getInitials = (name) => {
  return String(name || 'ST')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'ST';
};

const buildStudentDb = () => {
  const db = {};

  rawStudentList.forEach(item => {
    const roll = String(item.Roll_Number || item.rollNumber || '').trim().toUpperCase();
    if (!roll) return;
    const name = String(item.FullName || item.fullName || item.name || roll).trim();
    const branch = String(item.Branch || item.branch || 'Computer Science & Engineering').trim();
    const year = Number(item.year || item.Year || (roll === "24S05A5403" || roll === "24S01A0528" ? 3 : 4));
    const section = String(item.section || item.Section || 'A').trim();
    const sem = String(item.semester || item.Semester || (year === 3 ? "3-1" : "4-1")).trim();
    const acadYear = String(item.academicYear || item.AcademicYear || "2024-2028").trim();

    db[roll] = {
      roll,
      password: roll,
      name,
      branch,
      year,
      section,
      semester: sem,
      academicYear: acadYear,
      avatar: getInitials(name),
      conducted: 120,
      attended: 95,
      weekly: { 1: "P", 2: "P", 3: "P", 4: "P", 5: "A", 6: "P", 0: "H" },
      monthlyAttendance: [
        { month: "Jan", conducted: 20, attended: 18 },
        { month: "Feb", conducted: 22, attended: 19 },
        { month: "Mar", conducted: 25, attended: 21 },
        { month: "Apr", conducted: 18, attended: 15 },
        { month: "May", conducted: 20, attended: 14 },
        { month: "Jun", conducted: 15, attended: 8 }
      ],
      recentActivity: [
        { type: "attendance", title: "Web Technologies (L)", status: "Present", time: "Today, 10:45 AM" },
        { type: "attendance", title: "Compiler Design (T)", status: "Present", time: "Yesterday, 02:15 PM" },
        { type: "attendance", title: "Software Engineering (L)", status: "Present", time: "15 July, 11:30 AM" },
        { type: "notice", title: "Mid-Term Exam Schedule", status: "Announced", time: "14 July, 04:00 PM" }
      ]
    };

    // Also map alt roll with O/0 substitution if applicable
    const altRoll = roll.includes('O') ? roll.replace(/O/g, '0') : roll.replace(/0/g, 'O');
    if (altRoll !== roll && !db[altRoll]) {
      db[altRoll] = db[roll];
    }
  });

  // Preserve custom demo students if needed
  db["22CSE101"] = db["22CSE101"] || {
    roll: "22CSE101",
    password: "password",
    name: "Rahul Kumar",
    branch: "Computer Science & Engineering",
    semester: "6th Sem (III Year - II Sem)",
    academicYear: "2025-2026",
    avatar: "RK",
    conducted: 100,
    attended: 68,
    weekly: { 1: "P", 2: "P", 3: "A", 4: "A", 5: "P", 6: "P", 0: "H" },
    monthlyAttendance: [
      { month: "Jan", conducted: 18, attended: 15 },
      { month: "Feb", conducted: 20, attended: 16 }
    ],
    recentActivity: []
  };

  return db;
};

export const studentDb = buildStudentDb();

export const noticeDb = [
  {
    date: "16 July, 2026",
    title: "Semester Fees Payment Extension",
    content: "The deadline for the payment of the current semester tuition fees has been extended to July 30, 2026, without any late fee penalty.",
    category: "Important"
  },
  {
    date: "14 July, 2026",
    title: "CIST Hackathon 2026",
    content: "Registrations are now open for the annual CIST Hackathon starting on August 5, 2026. Cash prizes worth Rs 1,00,000 to be won.",
    category: "Event"
  },
  {
    date: "10 July, 2026",
    title: "Mid-Term Examinations Announcement",
    content: "The First Mid-Term examinations for all B.Tech and M.Tech students will commence from August 10, 2026. The detailed timetable is on the board.",
    category: "Academic"
  }
];

export const facultyDb = {
  "CSEHOD1": {
    roll: "CSEHOD1",
    employeeId: "CSEHOD1",
    password: "CSEHOD1",
    name: "Prof. Sridevi (HOD-CSE)",
    branch: "Computer Science & Engineering",
    semester: "Professor & HOD",
    academicYear: "CSE Block, Room 302",
    avatar: "HOD",
    role: "faculty",
    isHod: true,
    assignedSubjects: ["*"]
  },
  "FAC001": {
    roll: "FAC001",
    employeeId: "FAC001",
    password: "faculty@123",
    name: "Dr. K. Srinivas",
    branch: "Computer Science & Engineering",
    semester: "Senior Assistant Professor",
    academicYear: "CSE Block, Room 102",
    avatar: "KS",
    role: "faculty",
    isHod: false,
    assignedSubjects: ["REL", "M1", "WT", "AI", "DBMS", "DL"]
  },
  "FAC002": {
    roll: "FAC002",
    employeeId: "FAC002",
    password: "faculty@123",
    name: "Prof. M. Anita",
    branch: "Computer Science & Technology",
    semester: "Associate Professor",
    academicYear: "CST Block, Room 204",
    avatar: "MA",
    role: "faculty",
    isHod: false,
    assignedSubjects: ["HR&PM", "EP", "CN", "ML", "OS", "IOT"]
  },
  "FAC003": {
    roll: "FAC003",
    employeeId: "FAC003",
    password: "faculty@123",
    name: "Dr. P. Rajesh",
    branch: "Artificial Intelligence & Data Science",
    semester: "Assistant Professor",
    academicYear: "AIDS Block, Room 105",
    avatar: "PR",
    role: "faculty",
    isHod: false,
    assignedSubjects: ["BCT", "BDA", "EMI", "OM", "CD", "SE", "PROJECT"]
  }
};

window.studentDb = studentDb;
window.facultyDb = facultyDb;
window.noticeDb = noticeDb;
