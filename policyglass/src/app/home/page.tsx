"use client";

import Header from "../components/Header";
import AuthCheck from "../components/AuthCheck";
import AnimatedHero from "../components/AnimatedHero";
import { useState, useEffect } from "react";

export default function Home() {
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
              <div className="mb-8 p-6 bg-white border border-gray-200 rounded-[24px] transition-all duration-300 hover:shadow-lg">
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
                <form action="/results">
                  <div className="mb-4">
                    <label htmlFor="policyInput" className="block text-sm font-medium mb-2 text-foreground">
                      Paste a Policy URL
                    </label>
                    <input
                      id="policyInput"
                      name="policyInput"
                      className="w-full p-3 border border-gray-300 rounded-md text-foreground bg-white"
                      placeholder="Enter a policy URL..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-md transition-all duration-300 hover:shadow-md bg-emerald-700 text-white hover:bg-emerald-400"
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

                {/* Animated hero content */}
                <AnimatedHero />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
}
