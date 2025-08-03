"use client";

import Header from "../components/Header";
import AuthCheck from "../components/AuthCheck";
// import QuotaDashboard from "../components/QuotaDashboard";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import Link from "next/link";
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
                  
                  <div className="bg-white rounded-[16px] w-full max-w-2xl shadow-lg mt-4">
                    <div className="text-foreground">
                      <h3 className="font-bold text-white text-lg p-2 rounded-t-[16px] bg-lime-800 text-center">How does PolicyGlass work?</h3>
                      <p className="text-[#323232] p-6 mb-4">
                        Once a policy or terms page is sent, our agent gets to work by reading the content and grading it in sections. 
                        Once the grading is complete, you get a full report on which policies to be aware of and potential releases of liability.
                      </p>
                      
                      <h3 className="font-bold text-white text-lg p-2 bg-emerald-700 text-center">What is your Grading Criteria?</h3>
                      <p className="text-[#323232] p-6 mb-4">
                        Our proprietary scoring logic breaks term agreements down and measures them against a detailed rubric to ensure your safety and protection
                      </p>
                      
                      <h3 className="font-bold text-white text-lg p-2  bg-lime-800 text-center">Why use PolicyGlass?</h3>
                      <p className="text-[#323232] p-6">
                        More often than ever, companies are burying liability releases and hiding data collection practices within dense legal jargon.
                        PolicyGlass is built to aid your digital safety and protect your privacy.
                      </p>

                                  <div className="flex justify-center">
              <Link href="/analyze" className="px-6 py-3 my-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-400 transition-colors duration-300 font-semibold text-lg">
                Analyze a Policy Now
              </Link>
            </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action Button */}

          </div>

          {/* Testimonials Carousel */}
          <TestimonialsCarousel />

          {/* Coming Soon Section with Browser Extension Info */}
          <div className="w-full bg-lime-700 py-4">
            <div className="max-w-6xl mx-auto px-8 flex gap-8 items-center">
              {/* Left Column - Text Content */}
              <div className="w-1/3">
                <div className="flex items-center h-full">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 text-white">Coming Soon</h2>
                    <p className="text-white text-sm">
                      We&#39;re working on releasing a browser extension that will automate the policy review process. 
                      With this extension, you&#39;ll be able to instantly analyze terms of service and privacy policies 
                      while browsing the web. The extension will highlight potential concerns and provide a quick 
                      summary of the policy&#39;s implications for your privacy and rights.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="w-2/3 flex items-center justify-center">
                <img
                  src="/browser.jpg"
                  alt="PolicyGlass Browser Extension"
                  className="max-h-[250px] h-auto w-auto object-contain p-2"
                />
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
