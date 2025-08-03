'use client';

import React, { useState, useEffect } from 'react';
import { QuotaClientService } from '../services/quota-client.service';

interface QuotaInfo {
  remainingJobs: number;
  totalJobs: number;
  canCreateJob: boolean;
  resetTime: string;
  message: string;
}

export default function QuotaDashboard() {
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotaInfo();
    
    // Refresh quota info every 30 seconds
    const interval = setInterval(loadQuotaInfo, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadQuotaInfo = async () => {
    try {
      const info = await QuotaClientService.getQuotaForDashboard();
      if (info) {
        setQuotaInfo(info);
        setError(null);
      } else {
        setError('Failed to load quota information');
      }
    } catch (err) {
      setError('Error loading quota information');
      console.error('Error loading quota:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {error}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (!quotaInfo) {
    return null;
  }

  const getProgressColor = () => {
    if (quotaInfo.remainingJobs === 0) return 'bg-red-500';
    if (quotaInfo.remainingJobs === 1) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressWidth = () => {
    return `${(quotaInfo.remainingJobs / 3) * 100}%`;
  };

  const getBorderColor = () => {
    if (quotaInfo.remainingJobs === 0) return 'border-red-200';
    if (quotaInfo.remainingJobs === 1) return 'border-yellow-200';
    return 'border-green-200';
  };

  const getBackgroundColor = () => {
    if (quotaInfo.remainingJobs === 0) return 'bg-red-50';
    if (quotaInfo.remainingJobs === 1) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  return (
    <div className={`rounded-lg shadow-md p-6 border ${getBorderColor()} ${getBackgroundColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Daily Job Quota
        </h3>
        <button
          onClick={loadQuotaInfo}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh quota"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Jobs Remaining</span>
            <span>{quotaInfo.remainingJobs} / 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: getProgressWidth() }}
            ></div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-sm text-gray-700">
          {quotaInfo.message}
        </div>

        {/* Reset Time */}
        {quotaInfo.remainingJobs === 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Quota resets in:</span> {quotaInfo.resetTime}
          </div>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {quotaInfo.totalJobs}
            </div>
            <div className="text-sm text-gray-600">
              Used Today
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {quotaInfo.remainingJobs}
            </div>
            <div className="text-sm text-gray-600">
              Remaining
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center pt-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            quotaInfo.canCreateJob 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              quotaInfo.canCreateJob ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>
              {quotaInfo.canCreateJob ? 'Ready to analyze' : 'Quota exceeded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
