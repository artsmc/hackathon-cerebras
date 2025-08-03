"use client";

import { useState, useEffect, useRef } from "react";
import { Flag, AlertTriangle, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import Header from "../components/Header";
import Link from "next/link";
import { ToastService } from "../services/toast.service";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const bounceInAnimation = `
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: translateX(100px);
    }
    70% {
      transform: translateX(-10px);
    }
    100% {
      transform: translateX(0);
    }
  }
  
  .bounce-in {
    animation: bounceIn 0.6s linear;
  }
`;

interface JobData {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url: string;
  progress?: number;
  currentStep?: string;
  result?: {
    flags: string[];
    warnings: string[];
    reportId?: number;
  };
  error?: string;
}

interface ProcessingStep {
  step: string;
  timestamp: Date;
  progress?: number;
}

export default function Results() {
  const [showReport, setShowReport] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    if (jobId) {
      fetchJobData(jobId);
      connectWebSocket(jobId);
    } else {
      setError('No job ID provided');
      setLoading(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [jobId]);

  const fetchJobData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/policy/jobs/${id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobData(data);
        
        if (data.status === 'completed' && data.result) {
          setLoading(false);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch job data');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching job data:', err);
      setError('Network error while fetching job data');
      setLoading(false);
    }
  };

  const connectWebSocket = (id: string) => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/policy/jobs/${id}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'progress':
              setJobData(prev => prev ? {
                ...prev,
                progress: message.progress,
                currentStep: message.step
              } : null);
              
              setProcessingSteps(prev => [...prev, {
                step: message.step,
                timestamp: new Date(),
                progress: message.progress
              }]);
              
              ToastService.processingStep(message.step, message.progress);
              break;
              
            case 'completed':
              setJobData(prev => prev ? {
                ...prev,
                status: 'completed',
                result: message.result
              } : null);
              setLoading(false);
              ToastService.jobCompleted(id);
              break;
              
            case 'failed':
              setJobData(prev => prev ? {
                ...prev,
                status: 'failed',
                error: message.error
              } : null);
              setError(message.error);
              setLoading(false);
              ToastService.jobFailed(message.error);
              break;
              
            case 'step':
              setProcessingSteps(prev => [...prev, {
                step: message.step,
                timestamp: new Date()
              }]);
              ToastService.processingStep(message.step);
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      wsRef.current.onclose = () => {
        setWsConnected(false);
        console.log('WebSocket disconnected');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
      
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
    }
  };

  if (error) {
    return (
      <div className="font-sans min-h-screen py-4 pb-20">
        <Header />
        <main className="flex flex-col items-center justify-center h-80vh">
          <div className="text-center">
            <div className="inline-block p-3 rounded-full bg-red-100 mb-4">
              <XCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <Link 
              href="/home"
              className="mt-4 inline-block bg-foreground text-background px-6 py-2 rounded-md hover:bg-[#383838] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <ToastContainer />
      </div>
    );
  }

  if (loading || !jobData || jobData.status === 'pending' || jobData.status === 'processing') {
    return (
      <div className="font-sans min-h-screen py-4 pb-20">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl">
            <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
              <Clock className="text-blue-600 animate-spin" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {jobData?.status === 'processing' ? 'Analyzing Policy Document' : 'Preparing Analysis'}
            </h2>
            <p className="text-gray-600 mb-6">
              {jobData?.currentStep || 'Processing your request and generating insights...'}
            </p>
            
            {/* Progress Bar */}
            {jobData?.progress !== undefined && (
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{jobData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${jobData.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* WebSocket Status */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{wsConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            {/* Processing Steps */}
            {processingSteps.length > 0 && (
              <div className="text-left max-w-md mx-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Processing Steps:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {processingSteps.slice(-5).map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-gray-600">{step.step}</span>
                      {step.progress && (
                        <span className="text-gray-400">({step.progress}%)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <ToastContainer />
      </div>
    );
  }

  // Job completed - show results
  const flags = jobData.result?.flags || [];
  const warnings = jobData.result?.warnings || [];
  const urlDomain = new URL(jobData.url).hostname;

  return (
    <div className="font-sans min-h-screen py-4 pb-20">
      <Header />
      <style>{bounceInAnimation}</style>
      <main className="flex flex-col">
        
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto h-80vh">
          {/* Left Column - Flags and Warnings */}
          <div className={`bg-white border border-gray-200 rounded-[16px] p-6 transition-all duration-500 ease-out flex flex-col h-full ${showReport ? 'lg:w-1/3 transform' : 'lg:w-full'}`}>
            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <div className="inline-block p-3 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Analysis Complete</h2>
                <p className="text-gray-600 mt-2">Policy from {urlDomain}</p>
              </div>
              
              {/* Flags */}
              <div className="w-full mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">
                  Flags Identified ({flags.length})
                </h3>
                {flags.length > 0 ? (
                  <div className="space-y-3">
                    {flags.map((flag: string, index: number) => (
                      <div key={index} className="flex items-start p-3 bg-red-100 rounded-md">
                        <Flag className="text-red-800 mr-2 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-red-800">{flag}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-green-50 rounded-md">
                    <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
                    <p className="text-green-700">No critical issues found</p>
                  </div>
                )}
              </div>
              
              {/* Warnings */}
              <div className="w-full mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">
                  Warnings ({warnings.length})
                </h3>
                {warnings.length > 0 ? (
                  <div className="space-y-3">
                    {warnings.map((warning: string, index: number) => (
                      <div key={index} className="flex items-start p-3 bg-yellow-100 rounded-md">
                        <AlertTriangle className="text-yellow-800 mr-2 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-yellow-800">{warning}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-green-50 rounded-md">
                    <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
                    <p className="text-green-700">No warnings found</p>
                  </div>
                )}
              </div>
              
              {/* View Full Report Button */}
              <button
                onClick={() => setShowReport(!showReport)}
                className="bg-foreground text-background px-6 py-2 rounded-md hover:bg-[#383838] transition-colors font-medium"
              >
                {showReport ? "Hide Full Report" : "View Full Report"}
              </button>
            </div>
          </div>
          
          {/* Right Column - Report Preview */}
          {showReport && (
            <div className="bg-white border border-gray-200 rounded-[16px] p-6 lg:w-2/3 transition-all duration-500 ease-out bounce-in flex flex-col h-grow">
              <h2 className="text-xl font-semibold text-foreground mb-4">Full Policy Analysis Report</h2>
              <div className="prose max-w-none flex-grow overflow-auto">
                <h3>Executive Summary</h3>
                <p>Analysis of policy document from {urlDomain} has been completed. The system identified {flags.length} critical issues and {warnings.length} warnings that require attention.</p>
                
                <h4>Analysis Overview</h4>
                <div className="grid grid-cols-2 gap-4 not-prose mb-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{flags.length}</div>
                    <div className="text-sm text-red-700">Critical Issues</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{warnings.length}</div>
                    <div className="text-sm text-yellow-700">Warnings</div>
                  </div>
                </div>
                
                <h4>Key Findings</h4>
                {flags.length > 0 && (
                  <>
                    <h5>Critical Issues:</h5>
                    <ul>
                      {flags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {warnings.length > 0 && (
                  <>
                    <h5>Warnings:</h5>
                    <ul>
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                <h4>Methodology</h4>
                <p>Analysis conducted using AI-powered natural language processing techniques to identify patterns, inconsistencies, and potential issues in policy documents.</p>
                
                <h4>Recommendations</h4>
                <p>
                  {flags.length > 0 
                    ? "Address the critical issues identified above as they may pose significant compliance or user protection risks."
                    : "No critical issues were found. "
                  }
                  {warnings.length > 0 
                    ? " Review the warnings to improve policy clarity and effectiveness."
                    : " The policy appears to be well-structured with no major concerns."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Back to Home Button */}
        <div className="flex gap-4 mt-8 justify-center">
          <Link 
            className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/home"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
