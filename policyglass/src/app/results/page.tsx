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

interface ReportData {
  id: number;
  url: string;
  flags: string[];
  warnings: string[];
  overallSummary: string;
  letterGrade: string;
  totalScore: number;
  createdAt: Date;
}

interface ProcessingStep {
  step: string;
  timestamp: Date;
  progress?: number;
}

export default function Results() {
  const [showReport, setShowReport] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<{ close: () => void } | null>(null);
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const reportId = searchParams.get('reportId');

  useEffect(() => {
    if (reportId) {
      // Fetch existing report data
      fetchReportData(reportId);
    } else if (jobId) {
      // Fetch job data and connect to WebSocket
      fetchJobData(jobId);
      connectWebSocket(jobId);
    } else {
      setError('No job ID or report ID provided');
      setLoading(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [jobId, reportId]);

  const fetchReportData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/audit/report/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setReportData({
          id: data.id,
          url: data.url,
          flags: data.flags,
          warnings: data.warnings,
          overallSummary: data.overallSummary,
          letterGrade: data.letterGrade,
          totalScore: data.totalScore,
          createdAt: new Date(data.createdAt)
        });
        setLoading(false);
      } else {
        let errorMessage = 'Failed to fetch report data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const fetchJobData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/policy/jobs/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle the response structure properly
        if (data.job) {
          const job = data.job;
          const jobData = {
            id: job.id,
            status: job.status.toLowerCase() as 'pending' | 'processing' | 'completed' | 'failed',
            url: job.sourceUrl,
            progress: job.progressPercentage,
            currentStep: job.currentPhase === 'research' ? 'Researching policy document...' : 
                       job.currentPhase === 'audit' ? 'Generating audit report...' : 
                       'Processing...',
            result: job.status === 'COMPLETED' ? {
              flags: ['Sample flag 1', 'Sample flag 2'], // This would come from actual audit data
              warnings: ['Sample warning 1'],
              reportId: job.auditReportId
            } : undefined,
            error: job.error
          };
          
          setJobData(jobData);
          
          if (jobData.status === 'completed' && jobData.result) {
            setLoading(false);
          }
        } else {
          setError('Invalid job data received');
          setLoading(false);
        }
      } else {
        let errorMessage = 'Failed to fetch job data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching job data:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const connectWebSocket = (id: string) => {
    // WebSocket not supported in Next.js API routes, using polling instead
    console.log('Using polling instead of WebSocket for job updates');
    setWsConnected(false);
    
    // Start polling for job updates
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/policy/jobs/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const job = data.job;
          
          if (job) {
            // Update job data
            setJobData(prev => {
              const newData = {
                id: job.id,
                status: job.status.toLowerCase() as 'pending' | 'processing' | 'completed' | 'failed',
                url: job.sourceUrl,
                progress: job.progressPercentage,
                currentStep: job.currentPhase === 'research' ? 'Researching policy document...' : 
                           job.currentPhase === 'audit' ? 'Generating audit report...' : 
                           'Processing...',
                result: job.status === 'COMPLETED' ? {
                  flags: ['Sample flag 1', 'Sample flag 2'], // This would come from actual audit data
                  warnings: ['Sample warning 1'],
                  reportId: job.auditReportId
                } : undefined,
                error: job.error
              };
              
              // Check if status changed to completed or failed
              if (prev?.status !== newData.status) {
                if (newData.status === 'completed') {
                  setLoading(false);
                  ToastService.jobCompleted(id);
                  clearInterval(pollInterval);
                } else if (newData.status === 'failed') {
                  setError(newData.error || 'Job failed');
                  setLoading(false);
                  ToastService.jobFailed(newData.error || 'Job failed');
                  clearInterval(pollInterval);
                }
              }
              
              return newData;
            });
            
            // Add processing step if phase changed
            if (job.currentPhase) {
              setProcessingSteps(prev => {
                const lastStep = prev[prev.length - 1];
                const newStep = job.currentPhase === 'research' ? 'Research phase started' :
                              job.currentPhase === 'audit' ? 'Audit phase started' :
                              'Processing...';
                
                if (!lastStep || lastStep.step !== newStep) {
                  return [...prev, {
                    step: newStep,
                    timestamp: new Date(),
                    progress: job.progressPercentage
                  }];
                }
                return prev;
              });
            }
          }
        } else {
          console.error(`Polling failed: HTTP ${response.status}`);
          // Don't set error state during polling to avoid interrupting the user experience
          // Just log the error and continue polling
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        // Don't set error state during polling to avoid interrupting the user experience
        // Just log the error and continue polling
      }
    }, 3000); // Poll every 3 seconds (reduced frequency to be less aggressive)
    
    // Store interval reference for cleanup
    wsRef.current = { close: () => clearInterval(pollInterval) };
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

  if (loading) {
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

  // Show report data if available
  if (reportData) {
    const urlDomain = new URL(reportData.url).hostname;
    
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
                    Flags Identified ({reportData.flags.length})
                  </h3>
                  {reportData.flags.length > 0 ? (
                    <div className="space-y-3">
                      {reportData.flags.map((flag: string, index: number) => (
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
                    Warnings ({reportData.warnings.length})
                  </h3>
                  {reportData.warnings.length > 0 ? (
                    <div className="space-y-3">
                      {reportData.warnings.map((warning: string, index: number) => (
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
                  <p>{reportData.overallSummary}</p>
                  
                  <h4>Analysis Overview</h4>
                  <div className="grid grid-cols-2 gap-4 not-prose mb-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{reportData.flags.length}</div>
                      <div className="text-sm text-red-700">Critical Issues</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{reportData.warnings.length}</div>
                      <div className="text-sm text-yellow-700">Warnings</div>
                    </div>
                  </div>
                  
                  <h4>Score Details</h4>
                  <div className="not-prose">
                    <div className="text-3xl font-bold mb-2">Grade: {reportData.letterGrade}</div>
                    <div className="text-xl">Total Score: {reportData.totalScore}/100</div>
                  </div>
                  
                  <h4>Key Findings</h4>
                  {reportData.flags.length > 0 && (
                    <>
                      <h5>Critical Issues:</h5>
                      <ul>
                        {reportData.flags.map((flag, index) => (
                          <li key={index}>{flag}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  {reportData.warnings.length > 0 && (
                    <>
                      <h5>Warnings:</h5>
                      <ul>
                        {reportData.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  <h4>Methodology</h4>
                  <p>Analysis conducted using AI-powered natural language processing techniques to identify patterns, inconsistencies, and potential issues in policy documents.</p>
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

  // Job completed - show results
  const flags = jobData?.result?.flags || [];
  const warnings = jobData?.result?.warnings || [];
  const urlDomain = jobData?.url ? new URL(jobData.url).hostname : '';

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
