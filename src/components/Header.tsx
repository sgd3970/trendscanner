"use client";

import Link from 'next/link';
import { FaChartLine } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link 
          href="/" 
          className="flex items-center space-x-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
            <FaChartLine className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            트렌드스캐너
          </span>
        </Link>        
      </div>
    </header>
  );
} 