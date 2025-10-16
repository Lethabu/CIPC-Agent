import React, { useEffect } from 'react';

// Declare custom element for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'typebot-standard': {
        typebot?: string;
        'api-host'?: string;
      };
    }
  }
}

export default function App() {
  const typebotUrl = import.meta.env.VITE_TYPEBOT_URL || 'http://localhost:3002';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${typebotUrl}/integrations/web/v1/manage.js`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [typebotUrl]);

  return (
    <div className="min-h-screen">
      <typebot-standard typebot="cipc-onboarding" api-host={typebotUrl}></typebot-standard>
    </div>
  );
}
