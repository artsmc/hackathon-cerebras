"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthCheck from "../components/AuthCheck";
import Header from "../components/Header";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submit logic here
    console.log("Submitted value:", inputValue);
    // Navigate to results page after animations complete
    router.push("/results");
  };

  // State to track which animation should be displayed
  const [currentAnimation, setCurrentAnimation] = useState(0);

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

  return (
    <AuthCheck>
      <div className="font-sans min-h-screen py-4 pb-20">
        <Header />
        <main className="flex flex-col gap-8 items-center">
          
          <div className="flex w-full max-w-6xl gap-8">
            {/* Left Column - 33% width (increased from 25%) */}
            <div className="w-1/3 pl-8 pr-4">
              {/* Description Div */}
              <div className="mb-8 p-6 bg-white border border-gray-200 rounded-[24px] transition-all duration-300 hover:shadow-lg ">
                <h2 className="text-xl font-semibold mb-4 text-foreground">About PolicyGlass</h2>
                <p className="text-foreground">
                  PolicyGlass is an innovative platform that helps you analyze and understand complex policy documents. 
                  Our AI-powered tool breaks down legal jargon into comprehensible insights, making policy analysis 
                  accessible to everyone. Simply enter a policy document or topic in the input field to get started.
                </p>
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
                      className="w-full p-3 border border-gray-300 rounded-md text-foreground bg-white"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter a policy URL..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-400 transition-all duration-300 hover:shadow-md"
                  >
                    Analyze Policy
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
                
                {/* Animation container - half width, positioned above center, with left padding */}
                <div className="absolute top-[20%] left-[5%] w-1/2 z-10">
                  <AnimatePresence>
                    {currentAnimation === 0 && (
                      <motion.div
                        key="text"
                        className="relative z-10 w-full text-center p-8"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-2xl font-bold text-foreground bg-background bg-opacity-80 p-4 rounded-lg">
                          Review these terms and conditions
                        </p>
                      </motion.div>
                    )}
                    
                    {currentAnimation === 1 && (
                      <motion.div
                        key="flags"
                        className="relative z-10 w-full bg-white bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
                          Analysis Results
                        </h2>
                        
                        {/* Flags */}
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-foreground mb-2">Flags Identified</h3>
                          <div className="space-y-2">
                            <div className="flex items-start p-2 bg-red-100 rounded">
                              <span className="text-red-800 text-sm">Potential bias detected in policy language</span>
                            </div>
                            <div className="flex items-start p-2 bg-red-100 rounded">
                              <span className="text-red-800 text-sm">Contradictory statements found</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Warnings */}
                        <div>
                          <h3 className="text-lg font-medium text-foreground mb-2">Warnings</h3>
                          <div className="space-y-2">
                            <div className="flex items-start p-2 bg-yellow-100 rounded">
                              <span className="text-yellow-800 text-sm">Implementation timeline appears unrealistic</span>
                            </div>
                            <div className="flex items-start p-2 bg-yellow-100 rounded">
                              <span className="text-yellow-800 text-sm">Compliance requirements not clearly defined</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {currentAnimation === 2 && (
                      <motion.div
                        key="review"
                        className="relative z-10 w-full bg-white bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex justify-center mb-4">
                          {/* 5 star rating */}
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.404 1.833L13.7 11.29a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.969-.592-.366-1.839.404-1.839h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-foreground">
                          PolicyGlass protected me from agreeing to Disney’s predatory release of liability within Disney+. Now, if I get injured, I have the grounds to sue!
                        </p>
                        <p className="text-foreground font-medium mt-4">- Alexandra Rosay, Associate Analyst</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}
