'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedId = localStorage.getItem('user_id');

    if (!storedRole || !storedId) {
      window.location.href = '/login';
    } else {
      setRole(storedRole);
      setUserId(storedId);
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
      <p>Logged in as: <b>{role}</b></p>
      <p>User ID: {userId}</p>
    </div>
  );
}
