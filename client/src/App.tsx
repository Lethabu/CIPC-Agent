import React from 'react';
import { Typebot } from '@typebot.io/react';

export default function App() {
  const typebotUrl = import.meta.env.VITE_TYPEBOT_URL || 'http://localhost:3002';

  return (
    <div className="min-h-screen">
      <Typebot
        typebot="cipc-onboarding"
        apiHost={typebotUrl}
      />
    </div>
  );
}
