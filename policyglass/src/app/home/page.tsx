"use client";

import Header from "../components/Header";
import AuthCheck from "../components/AuthCheck";
import QuotaDashboard from "../components/QuotaDashboard";
import { useState } from "react";
import { QuotaClientService } from "../services/quota-client.service";
import { ToastService } from "../services/toast.service";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [policyUrl, setPolicyUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!policyUrl.trim()) {
      ToastService.error('Please enter a policy URL');
      return;
    }

    // Validate URL format
    try {
      new URL(policyUrl);
    } catch {
      ToastService.error('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check quota before creating job
      const quotaValidation = await QuotaClientService.validateJobCreation();
      
      if (!quotaValidation.canCreateJob) {
        if (quotaValidation.quota) {
          ToastService.quotaExceeded(quotaValidation.quota.timeUntilReset);
        } else {
          ToastService.error(quotaValidation.error || 'Cannot create job at this time');
        }
        return;
      }

      // Create the job
      const response = await fetch('/api/policy/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url: policyUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        // Get updated quota info
        const quotaInfo = await QuotaClientService.getQuotaForDashboard();
        if (quotaInfo) {
          ToastService.jobCreatedSuccess(quotaInfo.remainingJobs);
        } else {
          ToastService.success('Job created successfully!');
        }

        // Navigate to results page with job ID
        window.location.href = `/results?jobId=${data.jobId}`;
      } else {
        if (response.status === 429) {
          // Quota exceeded
          if (data.quota) {
            ToastService.quotaExceeded(data.quota.timeUntilReset);
          } else {
            ToastService.error('Daily job limit reached');
          }
        } else {
          ToastService.error(data.error || 'Failed to create job');
        }
      }
    } catch (error) {
      console.error('Error creating job:', error);
      ToastService.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCheck>
      <div className="font-sans min-h-screen py-4 pb-20">
        <Header />
        <main className="flex flex-col gap-8 items-center">
          {/* Hero Section with Background Image and Flow Diagram */}
          <div 
            className="w-full relative mb-8"
            style={{ 
              backgroundImage: "url('/hero.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Dark overlay for background image */}
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="py-8 px-8 relative z-10">
              <h1 className="text-4xl font-bold text-white text-shadow-lg/20 text-center mb-12">See through <span className="text-lime-300">deceptive</span> terms and <span className="text-lime-300">predatory</span> policies with PolicyGlass.</h1>
              
              {/* Flow Diagram Section */}
              <div className="w-full max-w-6xl mx-auto">
                {/* Horizontal flow diagram */}
                <div className="flex items-center justify-between mb-12">
                  <div className="bg-white border border-gray-200 rounded-[16px] p-6 w-48 h-32 flex items-center justify-center shadow-lg">
                    <span className="text-center font-semibold">Policy Input</span>
                  </div>
                  
                  <svg width="80" height="20" viewBox="0 0 80 20" className="text-white">
                    <path d="M0 10 L70 10 M70 10 L65 5 M70 10 L65 15" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                  
                  <div className="bg-white border border-gray-200 rounded-[16px] p-6 w-48 h-32 flex items-center justify-center shadow-lg">
                    <span className="text-center font-semibold">AI Processing</span>
                  </div>
                  
                  <svg width="80" height="20" viewBox="0 0 80 20" className="text-white">
                    <path d="M0 10 L70 10 M70 10 L65 5 M70 10 L65 15" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                  
                  <div className="bg-white border border-gray-200 rounded-[16px] p-6 w-48 h-32 flex items-center justify-center shadow-lg">
                    <span className="text-center font-semibold">Results</span>
                  </div>
                </div>
                
                {/* Vertical arrow and content div */}
                <div className="flex flex-col items-center fade-in-down">
                  <svg width="20" height="60" viewBox="0 0 20 60" className="text-white">
                    <path d="M10 0 L10 50 M10 50 L5 45 M10 50 L15 45" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                  
                  <div className="bg-white shadow-md shadow-[#EAEAEA] rounded-[16px] w-full max-w-2xl shadow-lg mt-4">
                    <div className="text-foreground">
                      <h3 className="font-bold text-white text-lg p-2 rounded-t-[16px] bg-lime-800 text-center">How does PolicyGlass work?</h3>
                      <p className="text-[#323232] p-6 mb-4">
                        Once a policy or terms page is sent, our agent gets to work by reading the content and grading it in sections. 
                        Once the grading is complete, you get a full report on which policies to be aware of and potential releases of liability.
                      </p>
                      
                      <h3 className="font-bold text-white text-lg p-2 bg-emerald-700 text-center">What is your Grading Criteria?</h3>
                      <p className="text-[#323232] p-6 mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                      
                      <h3 className="font-bold text-white text-lg p-2  bg-lime-800 text-center">Why use PolicyGlass?</h3>
                      <p className="text-[#323232] p-6">
                        More often than ever, companies are burying liability releases and hiding data collection practices within dense legal jargon. 
                        PolicyGlass is built to aid your digital safety and protect your privacy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Banner */}
          <div className="w-full bg-emerald-500 py-4 text-center text-white font-bold text-xl">
            Coming Soon
          </div>

          <div className="flex w-full max-w-6xl gap-8">
            {/* Left Column - 33% width (increased from 25%) */}
            <div className="w-1/3 pl-8 pr-4">
              {/* Description Div */}
              <div className="mb-8 p-6 bg-white border border-gray-200 rounded-[24px] transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-foreground">About PolicyGlass</h2>
                <p className="text-foreground">
                  PolicyGlass is an innovative platform that helps you analyze and understand complex policy documents.
                  Our AI-powered tool breaks down legal jargon into comprehensible insights, making policy analysis
                  accessible to everyone. Simply enter a policy document or topic in the input field to get started.
                </p>
              </div>

              {/* Quota Dashboard */}
              <div className="mb-8">
                <QuotaDashboard />
              </div>

              {/* Input Div */}
              <div className="p-6 bg-white border border-gray-200 rounded-[24px] transition-all duration-300 hover:shadow-lg animate-breathing-shadow">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Analyze a Policy</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="policyInput" className="block text-sm font-medium mb-2 text-foreground">
                      Paste a Policy URL
                    </label>
                    <input
                      id="policyInput"
                      name="policyInput"
                      value={policyUrl}
                      onChange={(e) => setPolicyUrl(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md text-foreground bg-white"
                      placeholder="Enter a policy URL..."
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-md transition-all duration-300 hover:shadow-md bg-emerald-700 text-white hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Job...' : 'Analyze Policy'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - 67% width */}
            <div className="w-2/3 pr-8 pl-4 flex items-center justify-center relative">
              <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-[24px] flex items-center justify-center overflow-hidden relative">
                {/* Background image */}
                <img
                  src="/home.jpg"
                  alt="Policy analysis background"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Animated hero content - removed for now since we're using a static hero */}
                <div className="relative z-10 text-center p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Policy Analysis Visualization</h2>
                  <p className="text-foreground">Your policy analysis results will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Toast Container */}
        <ToastContainer />
      </div>
    </AuthCheck>
  );
}
