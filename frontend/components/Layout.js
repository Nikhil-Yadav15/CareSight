'use client';

import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/supabase';
import { useRouter } from 'next/navigation'; // ✅ correct for App Router

export default function Layout({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login'); // ✅ still works in App Router
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {user && (
        <nav className="bg-white shadow-sm border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">CareSight</h1>
                <span className="ml-4 text-sm text-gray-600">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.full_name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl ">
        {children}
      </main>
    </div>
  );
}
