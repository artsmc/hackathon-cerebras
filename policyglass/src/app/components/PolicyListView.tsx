"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText } from 'lucide-react';
import PolicyCard from './PolicyCard';
import { PolicyListItem } from '../types/policy-list.types';

interface PolicyListViewProps {
  userId?: number;
}

export default function PolicyListView({ userId }: PolicyListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
        const newHistory = [searchTerm.trim(), ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        localStorage.setItem('policySearchHistory', JSON.stringify(newHistory));
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('policySearchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch {
        setSearchHistory([]);
      }
    }
  }, []);

  // Fetch policies with TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['policies', { search: debouncedSearchTerm, page, userId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/policy/list?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime was renamed to gcTime in v5)
  });

  // Filter search suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchHistory.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, searchHistory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">Failed to load policies</div>
        <div className="text-sm text-gray-500 mt-2">{error.message}</div>
      </div>
    );
  }

  const policies: PolicyListItem[] = data?.policies || [];
  const totalPages: number = data?.totalPages || 1;
  const total: number = data?.total || 0;

  return (
    <div className="w-full">
      {/* Search Section */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search by company name or URL..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Auto-complete suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onMouseDown={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {policies.length} of {total} policies
      </div>

      {/* Policy Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : policies.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-foreground mb-2">No policies found</h3>
          <p className="text-gray-500">
            {debouncedSearchTerm 
              ? 'Try adjusting your search terms' 
              : 'No policies have been analyzed yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              id={policy.id}
              url={policy.url}
              company={policy.company}
              created_at={policy.created_at}
              reportId={policy.reportId}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 2 && pageNum <= page + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      page === pageNum
                        ? 'bg-foreground text-background'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === page - 3 || pageNum === page + 3) {
                return (
                  <span key={pageNum} className="px-2 py-1.5 text-sm text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
