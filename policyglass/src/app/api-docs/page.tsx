'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ApiMethod {
  summary?: string;
  operationId?: string;
  [key: string]: unknown;
}

interface ApiPaths {
  [path: string]: {
    [method: string]: ApiMethod;
  };
}

interface ApiSpec {
  paths: ApiPaths;
  [key: string]: unknown;
}

export default function ApiDocsPage() {
  const router = useRouter();
  const [spec, setSpec] = useState<ApiSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error(`Failed to fetch API spec: ${response.status}`);
        }
        const data = await response.json();
        setSpec(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API specification');
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Documentation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/api/docs')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Raw API Specification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PolicyGlass API Documentation</h1>
          <p className="text-gray-600 mb-6">Interactive API documentation for the PolicyGlass application</p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">API Specification</h2>
            <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(spec, null, 2)}
              </pre>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Endpoints</h3>
            <div className="grid gap-4">
              {spec && Object.entries(spec.paths).map(([path, methods]: [string, ApiPaths[string]]) => (
                <div key={path} className="border rounded-lg p-4 bg-gray-50">
                  <div className="font-mono text-sm text-gray-700 mb-2">{path}</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(methods).map(([method, details]: [string, ApiMethod]) => (
                      <span 
                        key={method} 
                        className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize"
                      >
                        {method}: {details.summary || details.operationId}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => router.push('/api/docs')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Raw JSON Specification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
