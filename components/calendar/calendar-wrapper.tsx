'use client';

import { useState, useEffect } from 'react';
import CalComEmbed, { getCalApi } from '@calcom/embed-react';
import { useCalendarConfig } from './calendar-config';

interface CalendarWrapperProps {
  username?: string;
  eventSlug?: string;
  className?: string;
  height?: string;
}

export default function CalendarWrapper({
  username,
  eventSlug,
  className = '',
  height = '100%'
}: CalendarWrapperProps) {
  const config = useCalendarConfig();
  const calUsername = username || config.username;
  const calEventSlug = eventSlug || config.defaultEventSlug;

  const calLink = `${calUsername}/${calEventSlug}`;

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: calEventSlug });
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, []);

  // Set the embed as loaded after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {!isLoaded && (
        <div className="flex items-center justify-center w-full h-64">
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      )}
      <div className={`${!isLoaded ? 'invisible' : 'visible'}`}>
        <CalComEmbed
          namespace={calEventSlug}
          calLink={calLink}
          style={{ width: '100%', height, overflow: 'scroll' }}
          config={{
            layout: 'month_view',
            hideEventTypeDetails: 'false',
            hideBranding: 'true'
          }}
        />
      </div>
    </div>
  );
}
