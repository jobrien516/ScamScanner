import React, { useEffect, useRef } from 'react';

interface WebSocketProgressLogProps {
  messages: string[];
}

const WebSocketProgressLog: React.FC<WebSocketProgressLogProps> = ({ messages }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={logContainerRef}
      className="bg-slate-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm text-slate-400 space-y-2"
    >
      {messages.map((msg, i) => (
        <p key={i} className="animate-fade-in">{`> ${msg}`}</p>
      ))}
    </div>
  );
};

export default WebSocketProgressLog;