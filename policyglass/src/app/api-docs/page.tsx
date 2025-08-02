'use client';

import { useEffect, useState } from 'react';

export default function ApiDocsPage() {
  const [SwaggerUI, setSwaggerUI] = useState<any>(null);

  useEffect(() => {
    // Dynamically import SwaggerUI to avoid SSR issues
    import('swagger-ui-react').then((SwaggerUIReact) => {
      setSwaggerUI(() => SwaggerUIReact.default);
    });
  }, []);

  if (!SwaggerUI) {
    return <div className="p-8">Loading API documentation...</div>;
  }

  return (
    <div className="w-full h-screen">
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
