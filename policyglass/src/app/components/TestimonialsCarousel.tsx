"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestimonialsCarousel() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      id: 1,
      text: "PolicyGlass saved me from unknowingly waiving my rights in Netflix's terms of service. I never realized how much I was giving up until I used this tool!",
      author: "Jamie Rodriguez",
      position: "Privacy Advocate"
    },
    {
      id: 2,
      text: "Before PolicyGlass, I just clicked 'Accept' on Spotify's privacy policy. Now I understand exactly what I'm agreeing to and can make informed decisions.",
      author: "Taylor Kim",
      position: "Data Protection Specialist"
    },
    {
      id: 3,
      text: "Amazon's return policy had so many loopholes that I was missing. PolicyGlass highlighted the key issues and helped me avoid potential disputes.",
      author: "Morgan Ellis",
      position: "Consumer Rights Attorney"
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length, isPaused]);

  return (
    <div 
      className="w-full max-w-4xl mx-auto mb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTestimonial}
          className="bg-white bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
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
            &ldquo;{testimonials[currentTestimonial].text}&rdquo;
          </p>
          <p className="text-foreground font-semibold mt-4">
            - {testimonials[currentTestimonial].author}, {testimonials[currentTestimonial].position}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
