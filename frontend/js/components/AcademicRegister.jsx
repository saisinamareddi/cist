import React, { useState, useEffect } from 'react';

export function AcademicRegister() {
  const [activeStudent, setActiveStudent] = useState(window.activeStudent || null);

  const [studentInfo, setStudentInfo] = useState({
    roll: '',
    name: '',
    branch: '',
    section: 'A',
    semester: 'Sem 6',
    academicYear: '2026-27',
    batch: '2023-2027'
  });

  const [filters, setFilters] = useState({
    academicYear: '2026-27',
    semester: 'Sem 6',
    month: '07', // July
    subject: 'ALL'
  });

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Subject list matching CIST semester config
  const semesterSubjectsMap = {
    'Sem 1': ['M1', 'EP', 'BEE', 'CP'],
    'Sem 2': ['M2', 'EC', 'DS', 'EG'],
    'Sem 3': ['MFCS', 'OOP', 'DE', 'DMS'],
    'Sem 4': ['DBMS', 'OS', 'COA', 'P&S'],
    'Sem 5': ['WT', 'CN', 'FLAT', 'DAA'],
    'Sem 6': ['REL', 'HR&PM', 'BCT', 'BDA', 'EMI', 'OM', 'PE', 'COI', 'EII'],
    'Sem 7': ['AI', 'CNS', 'CC', 'ML'],
    'Sem 8': ['DL', 'IOT', 'PROJECT']
  };

  const currentSubjects = semesterSubjectsMap[filters.semester] || semesterSubjectsMap['Sem 6'];

  // Months listing
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Load student info and initial records
  useEffect(() => {
    const handleStudentLoaded = (e) => {
      const student = e.detail || window.activeStudent;
      if (student) {
        setActiveStudent(student);
        setStudentInfo({
          roll: student.roll || student.rollNumber || '',
          name: (student.name || '').toUpperCase(),
          branch: student.branch || '',
          section: student.section || 'A',
          semester: student.semester || 'Sem 6',
          academicYear: student.academicYear || '2026-27',
          batch: student.batch || '2023-2027'
        });
        setFilters(prev => ({
          ...prev,
          semester: student.semester || 'Sem 6',
          academicYear: student.academicYear || '2026-27'
        }));
      }
    };

    window.addEventListener('student-loaded', handleStudentLoaded);

    // Initial load fallback if student is already loaded
    if (window.activeStudent) {
      handleStudentLoaded({ detail: window.activeStudent });
    }

    return () => {
      window.removeEventListener('student-loaded', handleStudentLoaded);
    };
  }, []);

  // Fetch or filter records when filters change
  useEffect(() => {
    setLoading(true);
    // Simulating database request latency
    const timer = setTimeout(() => {
      const allRecords = activeStudent?.attendanceHistory || [];
      
      // Filter records chronologically by month
      const filtered = allRecords.filter(r => {
        // Format of date YYYY-MM-DD
        const parts = r.date.split('-');
        if (parts.length === 3) {
          const monthMatch = parts[1] === filters.month;
          return monthMatch;
        }
        return false;
      });

      setAttendanceRecords(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.month, filters.semester, activeStudent]);

  // Extract unique sorted dates for header columns
  const uniqueDates = Array.from(new Set(attendanceRecords.map(r => r.date))).sort();

  // Helper: Format YYYY-MM-DD to DD/MM
  const formatDateLabel = (dateStr) => {
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;
  };

  // Compute stats per subject
  const subjectStats = currentSubjects.map(subj => {
    const subjRecords = attendanceRecords.filter(r => r.subject === subj);
    const held = subjRecords.length;
    const attended = subjRecords.filter(r => r.status === 'P' || r.status === 'Present').length;
    const absent = held - attended;
    const percent = held > 0 ? Math.round((attended / held) * 100) : 0;

    return {
      subject: subj,
      held,
      attended,
      absent,
      percent
    };
  });

  // Compute Overall Stats
  const totalHeld = subjectStats.reduce((sum, item) => sum + item.held, 0);
  const totalAttended = subjectStats.reduce((sum, item) => sum + item.attended, 0);
  const totalAbsent = totalHeld - totalAttended;
  const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "\ufeff"; // BOM
    const headers = ["Sl.No", "Subject", ...uniqueDates.map(formatDateLabel), "Held", "Attended", "Absent", "Percentage"];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\n";

    currentSubjects.forEach((subj, index) => {
      const stats = subjectStats.find(s => s.subject === subj);
      const row = [index + 1, subj];
      
      uniqueDates.forEach(date => {
        const dayRecords = attendanceRecords.filter(r => r.date === date && r.subject === subj);
        if (dayRecords.length === 0) {
          row.push("-");
        } else {
          row.push(dayRecords.map(r => r.status).join(''));
        }
      });

      row.push(stats.held, stats.attended, stats.absent, `${stats.percent}%`);
      csvContent += row.map(v => `"${v}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `academic_register_${studentInfo.roll}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => {
    if (window.switchSection) {
      window.switchSection('dashboard');
    }
  };

  return (
    <div className="font-sans antialiased text-slate-800 dark:text-slate-200">
      {/* Professional ERP Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 mb-6 shadow-md flex items-center gap-4">
        <img 
          src="clg/logo.png" 
          className="w-14 h-14 bg-white rounded-full p-1.5 shadow-sm object-contain" 
          alt="CHAITANYA logo" 
        />
        <div>
          <h2 className="text-xl font-bold tracking-wide uppercase mb-0.5">Academic Register</h2>
          <div className="text-sm opacity-90 font-bold tracking-wide uppercase">CHAITANYA Institute of Science and Technology</div>
          <div className="text-xs opacity-75">Approved by AICTE, Affiliated to JNTUK, Kakinada</div>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-blue-700 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          Student Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase text-xs">Student Name</span>
            <span className="font-bold">{studentInfo.name || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase text-xs">Roll Number</span>
            <span className="font-bold">{studentInfo.roll || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase text-xs">Branch & Section</span>
            <span className="font-bold">{studentInfo.branch} - Sec {studentInfo.section}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase text-xs">Semester & Year</span>
            <span className="font-bold">{studentInfo.semester} | Year 3</span>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Filter Register</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">Academic Year</label>
            <select 
              disabled
              value={filters.academicYear} 
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none cursor-not-allowed text-slate-500 font-semibold"
            >
              <option value={studentInfo.academicYear}>{studentInfo.academicYear}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">Semester</label>
            <select 
              disabled
              value={filters.semester} 
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none cursor-not-allowed text-slate-500 font-semibold"
            >
              <option value={studentInfo.semester}>{studentInfo.semester}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">Month</label>
            <select 
              value={filters.month} 
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-500">Subject Filter</label>
            <select 
              value={filters.subject} 
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">All Subjects</option>
              {currentSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid (Summary & Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        
        {/* Left Column: Overall Summary Card */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-grow">
            <h4 className="text-md font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Overall Summary</h4>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Held Classes:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{totalHeld}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Attended:</span>
                <span className="font-bold text-green-600">{totalAttended}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Absent:</span>
                <span className="font-bold text-red-600">{totalAbsent}</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-[10px] border-slate-100 dark:border-slate-800 mb-2">
                  <div className="text-center">
                    <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{overallPercentage}</span>
                    <span className="text-xs font-bold text-slate-400 block">%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${overallPercentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{ width: `${overallPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold mt-2 tracking-wide uppercase text-slate-400">
                  {overallPercentage >= 75 ? 'Good Standing' : 'Critical Attendance'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Horizontally Scrollable Table Wrapper */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="relative">
                {/* Scroll container wraps only the table */}
                <div className="overflow-x-auto overflow-y-auto max-h-[400px] border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-max min-w-full border-collapse text-center text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="sticky left-0 bg-slate-50 dark:bg-slate-800 font-bold p-3 border-b border-r border-slate-200 dark:border-slate-700 z-10 w-[60px] min-w-[60px]">Sl.No</th>
                        <th className="sticky left-[60px] bg-slate-50 dark:bg-slate-800 font-bold p-3 border-b border-r-[2px] border-slate-200 dark:border-slate-700 z-10 text-left w-[120px] min-w-[120px]">Subject</th>
                        {uniqueDates.map(date => (
                          <th key={date} className="p-3 font-bold border-b border-r border-slate-200 dark:border-slate-700 w-[65px] min-w-[65px]">
                            {formatDateLabel(date)}
                          </th>
                        ))}
                        <th className="p-3 font-bold border-b border-r border-slate-200 dark:border-slate-700 w-[80px] min-w-[80px]">Held</th>
                        <th className="p-3 font-bold border-b border-r border-slate-200 dark:border-slate-700 w-[80px] min-w-[80px]">Atted</th>
                        <th className="p-3 font-bold border-b border-r border-slate-200 dark:border-slate-700 w-[80px] min-w-[80px]">Abs</th>
                        <th className="p-3 font-bold border-b border-slate-200 dark:border-slate-700 w-[70px] min-w-[70px]">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSubjects
                        .filter(subj => filters.subject === 'ALL' || filters.subject === subj)
                        .map((subj, index) => {
                          const stats = subjectStats.find(s => s.subject === subj) || { held: 0, attended: 0, absent: 0, percent: 0 };
                          return (
                            <tr key={subj} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="sticky left-0 bg-white dark:bg-slate-900 font-bold p-3 border-b border-r border-slate-200 dark:border-slate-800 z-10 w-[60px] min-w-[60px]">{index + 1}</td>
                              <td className="sticky left-[60px] bg-white dark:bg-slate-900 font-bold p-3 border-b border-r-[2px] border-slate-200 dark:border-slate-800 z-10 text-left w-[120px] min-w-[120px]">{subj}</td>
                              {uniqueDates.map(date => {
                                const dayRecords = attendanceRecords.filter(r => r.date === date && r.subject === subj);
                                if (dayRecords.length === 0) {
                                  return (
                                    <td key={date} className="p-3 border-b border-r border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 w-[65px] min-w-[65px]">
                                      –
                                    </td>
                                  );
                                }
                                const statusString = dayRecords.map(r => r.status).join('');
                                const isP = statusString.includes('P');
                                return (
                                  <td 
                                    key={date} 
                                    className={`p-3 font-black border-b border-r border-slate-200 dark:border-slate-800 w-[65px] min-w-[65px] ${isP ? 'text-blue-600' : 'text-red-500'}`}
                                  >
                                    {statusString}
                                  </td>
                                );
                              })}
                              <td className="p-3 font-semibold border-b border-r border-slate-200 dark:border-slate-800 w-[80px] min-w-[80px]">{stats.held}</td>
                              <td className="p-3 font-semibold border-b border-r border-slate-200 dark:border-slate-800 w-[80px] min-w-[80px] text-green-600">{stats.attended}</td>
                              <td className="p-3 font-semibold border-b border-r border-slate-200 dark:border-slate-800 w-[80px] min-w-[80px] text-red-500">{stats.absent}</td>
                              <td className="p-3 font-bold border-b border-slate-200 dark:border-slate-800 w-[70px] min-w-[70px]">{stats.percent}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                {uniqueDates.length === 0 && (
                  <div className="text-center p-8 text-slate-400 font-bold">
                    No classes held for this month currently.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Fixed Action Buttons Container */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow-sm"
        >
          Print Register
        </button>
        <button 
          onClick={handlePrint}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow-sm"
        >
          Export PDF
        </button>
        <button 
          onClick={handleExportCSV}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow-sm"
        >
          Export CSV
        </button>
        <button 
          onClick={handleBack}
          className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition shadow-sm ml-auto"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
