"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <div className="w-full mb-12">
      {/* Title Bar */}
      <div className="bg-[#f0f4f2] py-4 px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          PolicyGlass
        </h1>
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
            New Analysis
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
