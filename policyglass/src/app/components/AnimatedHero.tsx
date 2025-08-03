"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedHero() {
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
    <div className="absolute top-[20%] left-[5%] w-1/2 z-10">
      <AnimatePresence>
        {currentAnimation === 0 && (
          <motion.div
            key="text"
            className="relative z-10 w-full text-center p-8"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: .5 }}
          >
            <p className="text-md text-foreground mb-4 text-center bg-background bg-opacity-80 p-4 rounded-lg">
              Analyze Disney+ Terms and Conditions
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
                  <span className="text-red-800 text-sm">Signs of Excessive Data Collection</span>
                </div>
                <div className="flex items-start p-2 bg-red-100 rounded">
                  <span className="text-red-800 text-sm">Ambiguous Risks and Liability Language</span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Warnings</h3>
              <div className="space-y-2">
                <div className="flex items-start p-2 bg-yellow-100 rounded">
                  <span className="text-yellow-800 text-sm">Moderate Risk of Content Rights</span>
                </div>
                <div className="flex items-start p-2 bg-yellow-100 rounded">
                  <span className="text-yellow-800 text-sm">Low Psychological and Algorithmic Impact</span>
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
            <p className="text-foreground italic">
              "PolicyGlass protected me from agreeing to Disney's predatory release of liability within Disney+. Now, if I get injured, I have the grounds to sue!""
            </p>
            <p className="text-foreground font-semibold mt-4">- Alexandra Rosay, Associate Analyst</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
