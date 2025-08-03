import React from 'react';
import { FileText, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PolicyCardProps {
  id: number;
  url: string;
  company: string;
  created_at: string;
  reportId?: number;
}

export default function PolicyCard({ id, url, company, created_at, reportId }: PolicyCardProps) {
  const domain = new URL(url).hostname;
  const date = new Date(created_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="text-blue-500" size={20} />
          <h3 className="font-medium text-foreground truncate">{company}</h3>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-1 mb-1">
          <ExternalLink size={14} />
          <span className="truncate">{domain}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>
      </div>
      
      {reportId ? (
        <Link 
          href={`/results?reportId=${reportId}`}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-foreground rounded-md hover:bg-[#383838] transition-colors"
        >
          View Report
        </Link>
      ) : (
        <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed">
          No Report
        </div>
      )}
    </div>
  );
}
