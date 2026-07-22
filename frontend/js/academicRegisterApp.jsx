import React from 'react';
import { createRoot } from 'react-dom/client';
import { AcademicRegister } from './components/AcademicRegister.jsx';

const rootElement = document.getElementById('academic-register-react-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<AcademicRegister />);
}
