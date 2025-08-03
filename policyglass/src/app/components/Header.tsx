"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div className="w-full">
      {/* Title Bar */}
      <div className="bg-[#f0f4f2] py-4 px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          PolicyGlass
        </h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-emerald-700 text-white rounded-md font-medium hover:bg-emerald-600 transition-colors duration-300"
        >
          Logout
        </button>
      </div>
      
      {/* Navigation Bar */}
      <nav className="bg-emerald-700">
        <div className="flex gap-4 py-4 px-8">
          <Link 
            href="/home"
            className={`px-4 py-2 rounded-md font-medium ${
              pathname === '/home' || pathname === '/' 
                ? 'bg-white text-emerald-700' 
                : 'text-white hover:bg-white hover:bg-opacity-20 hover:text-emerald-700 transition-all duration-300'
            }`}
          >
            Home
          </Link>
          
          <Link 
            href="/analyze"
            className={`px-4 py-2 rounded-md font-medium ${
              pathname === '/analyze' 
                ? 'bg-white text-emerald-700' 
                : 'text-white hover:bg-white hover:bg-opacity-20 hover:text-emerald-700 transition-all duration-300'
            }`}
          >
            Analyze
          </Link>
          
          <Link 
            href="/dashboard"
            className={`px-4 py-2 rounded-md font-medium ${
              pathname === '/dashboard' 
                ? 'bg-white text-emerald-700' 
                : 'text-white hover:bg-white hover:bg-opacity-20 hover:text-emerald-700 transition-all duration-300'
            }`}
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </div>
  );
}
