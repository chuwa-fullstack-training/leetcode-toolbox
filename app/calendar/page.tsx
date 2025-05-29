'use client';

import CalendarWrapper from '@/components/calendar/calendar-wrapper';
import { CalendarConfigProvider } from '@/components/calendar/calendar-config';

export default function CalendarPage() {
  return (
    <CalendarConfigProvider
      config={{
        username: 'aarzhang', // Replace with your actual Cal.com username
        defaultEventSlug: '30min' // Replace with your actual event slug
      }}
    >
      <div className="w-full flex flex-col items-center justify-center min-h-screen py-8">
        <h1 className="text-2xl font-bold mb-6">Book a time with me</h1>
        <div className="rounded shadow p-6 w-full max-w-4xl">
          <CalendarWrapper height="100%" />
        </div>
      </div>
    </CalendarConfigProvider>
  );
}
