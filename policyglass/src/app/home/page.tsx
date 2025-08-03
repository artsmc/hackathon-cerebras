"use client";

import Header from "../components/Header";
import AuthCheck from "../components/AuthCheck";
import AnimatedHero from "../components/AnimatedHero";
import QuotaDashboard from "../components/QuotaDashboard";
import { useState, useEffect } from "react";
import { QuotaClientService } from "../services/quota-client.service";
import { ToastService } from "../services/toast.service";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  // State to track which animation should be displayed
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [policyUrl, setPolicyUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle animation sequence progression
  useEffect(() => {
    // Progress to the next animation after a delay
    const animationTimer = setTimeout(() => {
      if (currentAnimation < 2) { // Only progress through first two animations
        setCurrentAnimation(prev => prev + 1);
      }
    }, 2000); // Show each animation for 2 seconds

    return () => clearTimeout(animationTimer);
  }, [currentAnimation]);

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

                {/* Animated hero content */}
                <AnimatedHero />
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
