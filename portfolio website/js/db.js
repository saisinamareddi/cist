// CIST Portal Student Database & Mock Records

export const studentDb = {
  "24S05A5403": {
    roll: "24S05A5403",
    password: "24S05A5403",
    name: "Sinamareddi Sai",
    branch: "Computer Science & Engineering",
    semester: "7th Sem (IV Year - I Sem)",
    academicYear: "2026-2027",
    avatar: "SS",
    conducted: 120,
    attended: 82,
    weekly: {
      1: "P", // Mon
      2: "A", // Tue
      3: "P", // Wed
      4: "P", // Thu
      5: "A", // Fri
      6: "P", // Sat
      0: "H"  // Sun
    },
    monthlyAttendance: [
      { month: "Jan", conducted: 20, attended: 18 },
      { month: "Feb", conducted: 22, attended: 15 },
      { month: "Mar", conducted: 25, attended: 19 },
      { month: "Apr", conducted: 18, attended: 11 },
      { month: "May", conducted: 20, attended: 12 },
      { month: "Jun", conducted: 15, attended: 7 }
    ],
    recentActivity: [
      { type: "attendance", title: "Web Technologies (L)", status: "Present", time: "Today, 10:45 AM" },
      { type: "attendance", title: "Compiler Design (T)", status: "Absent", time: "Yesterday, 02:15 PM" },
      { type: "attendance", title: "Software Engineering (L)", status: "Present", time: "15 July, 11:30 AM" },
      { type: "notice", title: "Mid-Term Exam Schedule", status: "Announced", time: "14 July, 04:00 PM" },
      { type: "attendance", title: "Database Management (P)", status: "Present", time: "14 July, 09:15 AM" }
    ]
  },
  "22CSE101": {
    roll: "22CSE101",
    password: "password",
    name: "Rahul Kumar",
    branch: "Computer Science & Engineering",
    semester: "6th Sem (III Year - II Sem)",
    academicYear: "2025-2026",
    avatar: "RK",
    conducted: 100,
    attended: 68,
    weekly: {
      1: "P",
      2: "P",
      3: "A",
      4: "A",
      5: "P",
      6: "P",
      0: "H"
    },
    monthlyAttendance: [
      { month: "Jan", conducted: 18, attended: 15 },
      { month: "Feb", conducted: 20, attended: 16 },
      { month: "Mar", conducted: 22, attended: 14 },
      { month: "Apr", conducted: 16, attended: 9 },
      { month: "May", conducted: 14, attended: 8 },
      { month: "Jun", conducted: 10, attended: 6 }
    ],
    recentActivity: [
      { type: "attendance", title: "Machine Learning (L)", status: "Present", time: "Today, 09:30 AM" },
      { type: "attendance", title: "Computer Networks (T)", status: "Present", time: "Yesterday, 11:30 AM" },
      { type: "attendance", title: "Distributed Systems (L)", status: "Absent", time: "Yesterday, 02:00 PM" },
      { type: "notice", title: "Hackathon 2026 Registrations", status: "Open", time: "14 July, 10:00 AM" },
      { type: "attendance", title: "Cryptography Lab (P)", status: "Absent", time: "13 July, 02:00 PM" }
    ]
  },
  "22ECE102": {
    roll: "22ECE102",
    password: "password",
    name: "Priya Sharma",
    branch: "Electronics & Communication Engineering",
    semester: "6th Sem (III Year - II Sem)",
    academicYear: "2025-2026",
    avatar: "PS",
    conducted: 100,
    attended: 81,
    weekly: {
      1: "P",
      2: "P",
      3: "P",
      4: "P",
      5: "A",
      6: "P",
      0: "H"
    },
    monthlyAttendance: [
      { month: "Jan", conducted: 18, attended: 16 },
      { month: "Feb", conducted: 20, attended: 18 },
      { month: "Mar", conducted: 22, attended: 19 },
      { month: "Apr", conducted: 16, attended: 12 },
      { month: "May", conducted: 14, attended: 10 },
      { month: "Jun", conducted: 10, attended: 6 }
    ],
    recentActivity: [
      { type: "attendance", title: "VLSI Design (L)", status: "Present", time: "Today, 01:45 PM" },
      { type: "attendance", title: "Microprocessors Lab (P)", status: "Present", time: "Yesterday, 09:30 AM" },
      { type: "attendance", title: "Digital Signal Processing", status: "Present", time: "15 July, 11:30 AM" },
      { type: "notice", title: "IEEE Student Chapter Seminar", status: "Announced", time: "14 July, 05:00 PM" },
      { type: "attendance", title: "Antennas & Wave Propagation", status: "Absent", time: "13 July, 03:30 PM" }
    ]
  },
  "22ME103": {
    roll: "22ME103",
    password: "password",
    name: "Arjun Reddy",
    branch: "Mechanical Engineering",
    semester: "6th Sem (III Year - II Sem)",
    academicYear: "2025-2026",
    avatar: "AR",
    conducted: 100,
    attended: 92,
    weekly: {
      1: "P",
      2: "P",
      3: "P",
      4: "P",
      5: "P",
      6: "P",
      0: "H"
    },
    monthlyAttendance: [
      { month: "Jan", conducted: 18, attended: 18 },
      { month: "Feb", conducted: 20, attended: 19 },
      { month: "Mar", conducted: 22, attended: 21 },
      { month: "Apr", conducted: 16, attended: 15 },
      { month: "May", conducted: 14, attended: 12 },
      { month: "Jun", conducted: 10, attended: 7 }
    ],
    recentActivity: [
      { type: "attendance", title: "CAD/CAM Laboratory (P)", status: "Present", time: "Today, 09:30 AM" },
      { type: "attendance", title: "Heat Transfer (T)", status: "Present", time: "Yesterday, 10:45 AM" },
      { type: "attendance", title: "Dynamics of Machinery (L)", status: "Present", time: "15 July, 01:45 PM" },
      { type: "notice", title: "Industrial Visit to Vizag Steel", status: "Approved", time: "13 July, 12:30 PM" },
      { type: "attendance", title: "Design of Machine Elements", status: "Present", time: "13 July, 09:15 AM" }
    ]
  }
};

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
    password: "CSEHOD1",
    name: "Sridevi",
    branch: "Computer Science & Engineering",
    semester: "Professor & HOD",
    academicYear: "CSE Block, Room 302",
    avatar: "KR",
    role: "faculty",
    conducted: 120,
    attended: 115,
    weekly: {
      1: "P",
      2: "P",
      3: "P",
      4: "P",
      5: "P",
      6: "P",
      0: "H"
    },
    monthlyAttendance: [
      { month: "Jan", conducted: 20, attended: 20 },
      { month: "Feb", conducted: 22, attended: 22 },
      { month: "Mar", conducted: 25, attended: 24 },
      { month: "Apr", conducted: 18, attended: 17 },
      { month: "May", conducted: 20, attended: 18 },
      { month: "Jun", conducted: 15, attended: 14 }
    ],
    recentActivity: [
      { type: "attendance", title: "Web Technologies (L) Lecture", status: "Delivered", time: "Today, 10:45 AM" },
      { type: "attendance", title: "Compiler Design (T) Tutorial", status: "Delivered", time: "Yesterday, 02:15 PM" },
      { type: "notice", title: "Mid-Term Exam Schedule Drafted", status: "Submitted", time: "14 July, 04:00 PM" },
      { type: "attendance", title: "Database Management Lab (P)", status: "Delivered", time: "14 July, 09:15 AM" }
    ]
  }
};

window.studentDb = studentDb;
window.facultyDb = facultyDb;
window.noticeDb = noticeDb;
