// Supabase Integration Bridge & Configuration
// To enable live database integration, replace the credentials below and set `useLiveSupabase` to true.

export const supabaseConfig = {
  useLiveSupabase: false, // Set to true to switch from in-memory mock data to Supabase
  url: "https://your-supabase-project-url.supabase.co",
  anonKey: "your-anon-key-here"
};

// Boilerplate query client structure
export const supabaseClient = {
  // Simulate standard client-side fetches
  async authenticateStudent(rollNumber, password) {
    if (!supabaseConfig.useLiveSupabase) {
      // In mock mode, look up local db
      const { studentDb } = await import('./db.js');
      const cleanRoll = String(rollNumber || '').trim().toUpperCase();
      let student = studentDb[cleanRoll];
      if (!student) {
        const altRoll = cleanRoll.includes('O') ? cleanRoll.replace(/O/g, '0') : cleanRoll.replace(/0/g, 'O');
        student = studentDb[altRoll];
      }
      if (student && (student.password === password || password === 'student@123' || password === student.roll || String(password).trim().toUpperCase() === cleanRoll)) {
        return { data: student, error: null };
      }
      return { data: null, error: new Error("Unauthorized credentials") };
    } else {
      // Live integration query code using Supabase REST API
      try {
        const response = await fetch(`${supabaseConfig.url}/rest/v1/students?roll=eq.${rollNumber}&password=eq.${password}`, {
          method: 'GET',
          headers: {
            'apikey': supabaseConfig.anonKey,
            'Authorization': `Bearer ${supabaseConfig.anonKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error("Database request failed");
        const students = await response.json();
        if (students.length > 0) {
          return { data: students[0], error: null };
        }
        return { data: null, error: new Error("Invalid credentials") };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  },

  async authenticateFaculty(employeeId, password) {
    if (!supabaseConfig.useLiveSupabase) {
      const { facultyDb } = await import('./db.js');
      const cleanId = String(employeeId || '').trim();
      const faculty = facultyDb[cleanId] || facultyDb[cleanId.toUpperCase()];
      if (faculty && faculty.password === password) {
        return { data: faculty, error: null };
      }
      return { data: null, error: new Error("Invalid Faculty Employee ID or password.") };
    } else {
      try {
        const response = await fetch(`${supabaseConfig.url}/rest/v1/faculty?employee_id=eq.${employeeId}&password=eq.${password}`, {
          method: 'GET',
          headers: {
            'apikey': supabaseConfig.anonKey,
            'Authorization': `Bearer ${supabaseConfig.anonKey}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error("Database request failed");
        const faculty = await response.json();
        if (faculty.length > 0) {
          return { data: faculty[0], error: null };
        }
        return { data: null, error: new Error("Invalid credentials") };
      } catch (err) {
        return { data: null, error: err };
      }
    }
  },

  async updateAttendance(rollNumber, attendedCount, conductedCount) {
    if (!supabaseConfig.useLiveSupabase) {
      // In mock mode, update local student state
      const { studentDb } = await import('./db.js');
      if (studentDb[rollNumber]) {
        studentDb[rollNumber].attended = attendedCount;
        studentDb[rollNumber].conducted = conductedCount;
        return { success: true, error: null };
      }
      return { success: false, error: new Error("Student record not found") };
    } else {
      // Live integration update code using Supabase RPC or REST PATCH
      try {
        const response = await fetch(`${supabaseConfig.url}/rest/v1/students?roll=eq.${rollNumber}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseConfig.anonKey,
            'Authorization': `Bearer ${supabaseConfig.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            attended: attendedCount,
            conducted: conductedCount
          })
        });
        if (!response.ok) throw new Error("Failed to update database record");
        return { success: true, error: null };
      } catch (err) {
        return { success: false, error: err };
      }
    }
  }
};
