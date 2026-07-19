# CIST Portal - Supabase / PostgreSQL Integration Guide

This guide describes how to connect the CIST College ERP portal frontend to a live **Supabase** (PostgreSQL) backend. Follow these instructions to transition from mock JSON data to a production database.

---

## 💾 1. PostgreSQL Schema Design

Run the following SQL commands in your Supabase SQL Editor to set up the tables and indices.

### A. Students Table
Stores academic and authentication records for student accounts.

```sql
create table public.students (
  id uuid default gen_random_uuid() primary key,
  roll varchar(50) unique not null,
  password varchar(255) not null, -- In production, ensure passwords are encrypted
  name varchar(100) not null,
  branch varchar(150) not null,
  semester varchar(100) not null,
  academic_year varchar(20) not null,
  avatar varchar(10) not null default 'ST',
  conducted integer not null default 0,
  attended integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index roll number for fast lookups during authentication
create index idx_students_roll on public.students(roll);
```

### B. Attendance Logs Table
Stores day-to-day attendance statuses for students.

```sql
create table public.attendance_logs (
  id uuid default gen_random_uuid() primary key,
  student_roll varchar(50) references public.students(roll) on delete cascade,
  day_index integer not null, -- 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  day_name varchar(20) not null,
  status varchar(2) not null, -- 'P' = Present, 'A' = Absent, 'H' = Holiday
  logged_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Composite index for fast student attendance dashboard queries
create index idx_attendance_roll_day on public.attendance_logs(student_roll, day_index);
```

### C. Monthly Attendance Stats
Stores aggregated monthly summaries for progress rendering.

```sql
create table public.monthly_attendance_stats (
  id uuid default gen_random_uuid() primary key,
  student_roll varchar(50) references public.students(roll) on delete cascade,
  month_name varchar(10) not null, -- 'Jan', 'Feb', etc.
  conducted integer not null default 0,
  attended integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### D. News & Announcements Table
Stores news bulletins broadcasted across the dashboard portal.

```sql
create table public.notices (
  id uuid default gen_random_uuid() primary key,
  date varchar(30) not null,
  title varchar(150) not null,
  content text not null,
  category varchar(50) not null, -- 'Important', 'Event', 'Academic'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 🔒 2. Row-Level Security (RLS) Policies

Supabase automatically secures tables by default. Enable RLS on all tables to prevent unauthorized access.

```sql
alter table public.students enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.monthly_attendance_stats enable row level security;
alter table public.notices enable row level security;

-- Policy: Allow read access to notices for authenticated users
create policy "Allow read notices for everyone" on public.notices
  for select using (true);

-- Policy: Students can view only their own record
create policy "Students can view own profile" on public.students
  for select using (auth.role() = 'authenticated');

-- Policy: Students can view only their own logs
create policy "Students can view own attendance logs" on public.attendance_logs
  for select using (auth.role() = 'authenticated');
```

---

## ⚡ 3. Connecting Frontend to Supabase Client

### A. Load Supabase JS SDK
Link the official Supabase Client SDK CDN in `login.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### B. Initializing the Supabase Client
Update the configuration inside `portfolio website/js/supabase-config.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-project-url.supabase.co';
const supabaseKey = 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### C. Replacing Mock Sign-In Logic
Inside `portfolio website/js/auth.js`, query the `students` table:

```javascript
import { supabase } from './supabase-config.js';

export async function handleLoginSubmit(event) {
  event.preventDefault();
  const rollInput = document.getElementById('userIdentifier').value.trim();
  const passInput = document.getElementById('password').value;

  try {
    // Authenticate student using roll and password fields
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('roll', rollInput)
      .eq('password', passInput) // Use bcrypt password verification in production
      .single();

    if (error || !student) {
      window.Toast.error("Invalid Roll Number or Password credentials.");
      return;
    }

    // Load dynamic dashboard modules
    window.loadRedesignedPortal(student);
  } catch (err) {
    window.Toast.error("Database connection failure.");
  }
}
```

### D. Fetching Dashboard Details
When the portal loads, fetch the related tables based on the roll number:

```javascript
// Fetch attendance logs
const { data: logs } = await supabase
  .from('attendance_logs')
  .select('*')
  .eq('student_roll', student.roll);

// Fetch monthly stats
const { data: monthly } = await supabase
  .from('monthly_attendance_stats')
  .select('*')
  .eq('student_roll', student.roll);
```
