"use client";

import { useState } from "react";
import { Flag, AlertTriangle, FileText } from "lucide-react";

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
    <div className="font-sans min-h-screen p-8 pb-20">
      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-center mb-8">
          Policy Analysis Results
        </h1>
        
        {/* Data Loading Section with Flags and Warnings */}
        <div className="w-full max-w-4xl mb-8">
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
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
        
        {/* Markdown Preview Area */}
        {showReport && (
          <div className="w-full max-w-4xl p-6 bg-white border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold text-foreground mb-4">Full Policy Analysis Report</h2>
            <div className="prose max-w-none">
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
            </div>
          </div>
        )}
        
        {/* Back to Home Button */}
        <div className="flex gap-4 mt-8">
          <a 
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/home"
          >
            Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
