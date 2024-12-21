import { useEffect, useState } from 'react';

type LogEntry = {
  type: string;
  timestamp: string;
  value: string;
};

const useActivityLogger = () => {
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        setLog(prevLog => [...prevLog, { type: 'click', timestamp: new Date().toISOString(), value: target.innerText }]);
      }
    };

    const handleInputChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      setLog(prevLog => [...prevLog, { type: 'input', timestamp: new Date().toISOString(), value: target.value }]);
    };

    document.addEventListener('click', handleButtonClick);
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', handleInputChange);
    });

    return () => {
      document.removeEventListener('click', handleButtonClick);
      document.querySelectorAll('input').forEach(input => {
        input.removeEventListener('input', handleInputChange);
      });
    };
  }, []);

  useEffect(() => {
    // Save log to local storage
    localStorage.setItem('userActivityLog', JSON.stringify(log));
  }, [log]);

  return log;
};

export default useActivityLogger;
