"use client";

import { useState } from "react";
import { Flag, AlertTriangle, FileText } from "lucide-react";
import Header from "../components/Header";

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

export default function Results() {
  const [showReport, setShowReport] = useState(false);
  
  // Placeholder data for flags and warnings
  const flags = [
    "Potential bias detected in policy language",
    "Contradictory statements found in sections 3.2 and 5.1",
    "Missing stakeholder consultation process"
  ];
  
  const warnings = [
    "Policy may have unintended consequences for small businesses",
    "Implementation timeline appears unrealistic",
    "Compliance requirements not clearly defined"
  ];

  return (
    <div className="font-sans min-h-screen py-4 pb-20">
      <Header />
      <style>{bounceInAnimation}</style>
      <main className="flex flex-col">
        
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto h-80vh">
          {/* Left Column - Flags and Warnings */}
          <div className={`bg-white border border-gray-200 rounded-lg p-6 transition-all duration-500 ease-out flex flex-col h-full ${showReport ? 'lg:w-1/3 transform' : 'lg:w-full'}`}>
            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                  <FileText className="text-foreground" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Analyzing Policy Document</h2>
                <p className="text-foreground mt-2">Processing your request and generating insights...</p>
              </div>
              
              {/* Flags */}
              <div className="w-full mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Flags Identified</h3>
                <div className="space-y-3">
                  {flags.map((flag, index) => (
                    <div key={index} className="flex items-start p-3 bg-red-100 rounded-md">
                      <Flag className="text-red-800 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-red-800">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Warnings */}
              <div className="w-full mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Warnings</h3>
                <div className="space-y-3">
                  {warnings.map((warning, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-100 rounded-md">
                      <AlertTriangle className="text-yellow-800 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-yellow-800">{warning}</span>
                    </div>
                  ))}
                </div>
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
            <div className="bg-white border border-gray-200 rounded-lg p-6 lg:w-2/3 transition-all duration-500 ease-out bounce-in flex flex-col h-grow">
              <h2 className="text-xl font-semibold text-foreground mb-4">Full Policy Analysis Report</h2>
              <div className="prose max-w-none flex-grow overflow-auto">
                <h3>Executive Summary</h3>
                <p>This policy analysis provides insights into the potential impacts and considerations of the reviewed policy document.</p>
                
                <h4>Key Findings</h4>
                <ul>
                  <li>Policy objective alignment with stakeholder interests</li>
                  <li>Risk assessment of implementation challenges</li>
                  <li>Recommendations for policy refinement</li>
                </ul>
                
                <h4>Methodology</h4>
                <p>Analysis conducted using AI-powered natural language processing techniques to identify patterns, inconsistencies, and potential issues.</p>
                
                <h4>Detailed Analysis</h4>
                <p>Full report content would be displayed here when connected to the API.</p>
                
                <h4>Additional Insights</h4>
                <p>When the "View Full Report" button is clicked, this section expands to take up the majority of the screen, similar to the layout in V0 dev or Claude artifacts. The flags section on the left shrinks to accommodate this larger report view.</p>
                
                <h4>Technical Implementation</h4>
                <p>This responsive layout uses Tailwind CSS classes to adjust the width of each section based on the state of the toggle button. On smaller screens, the sections stack vertically, while on larger screens they display side-by-side.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Back to Home Button */}
        <div className="flex gap-4 mt-8 justify-center">
          <a 
            className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/home"
          >
            Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
