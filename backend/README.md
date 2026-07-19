# CIST Attendance Backend

## Run

```bash
npm install
npm run dev
```

The server uses `backend/.env`:

```env
Mongo_Url=mongodb+srv://...
PORT=5000
STUDENT_PASSWORD=student@123
```

## Postman Routes

Health check:

```http
GET http://localhost:5000/api/health
```

Create or update one student:

```http
POST http://localhost:5000/api/students
Content-Type: application/json

{
  "rollNumber": "23S05A5403",
  "name": "Student Name",
  "branch": "CSE"
}
```

Student login:

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "rollNumber": "23S05A5403",
  "password": "student@123"
}
```

Successful login returns only:

```json
{
  "rollNumber": "23S05A5403",
  "name": "Student Name",
  "branch": "CSE"
}
```

Get student by roll number:

```http
GET http://localhost:5000/api/students/23S05A5403
```

## Import Roll JSON

Put your JSON file at `backend/data/students.json`, then run:

```bash
npm run import:students
```

The JSON can be an array, or an object with a `students` array. See `data/students.sample.json`.

## Import CSV Data

This backend supports CSV files with columns like:

```csv
FullName,Roll_Number,Branch
K Lavanya,23S01A0526,COMPUTER SCIENCE AND TECHNOLOGY
```

Run:

```bash
npm run import:students -- C:\Users\paris\Downloads\processed_students.csv
```
