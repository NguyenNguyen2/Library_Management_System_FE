'use client';

import React from 'react';

interface Criterion {
  label: string;
  test: (pw: string) => boolean;
}

const CRITERIA: Criterion[] = [
  { label: 'Tối thiểu 8 ký tự', test: (pw) => pw.length >= 8 },
  { label: 'Có chữ hoa (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Có chữ thường (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Có chữ số (0–9)', test: (pw) => /\d/.test(pw) },
  { label: 'Có ký tự đặc biệt (@$!%*?&)', test: (pw) => /[@$!%*?&]/.test(pw) },
];

interface Props {
  password: string;
}

const PasswordStrengthChecklist: React.FC<Props> = ({ password }) => {
  if (!password) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 space-y-1 mt-1">
      {CRITERIA.map((c) => {
        const pass = c.test(password);
        return (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            <span className={pass ? 'text-green-500 font-bold' : 'text-gray-400'}>
              {pass ? '✓' : '○'}
            </span>
            <span className={pass ? 'text-green-700' : 'text-gray-500'}>{c.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordStrengthChecklist;
