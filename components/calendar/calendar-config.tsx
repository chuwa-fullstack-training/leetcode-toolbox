'use client';

import { createContext, useContext, ReactNode } from 'react';

interface CalendarConfig {
  username: string;
  defaultEventSlug: string;
}

const defaultConfig: CalendarConfig = {
  username: 'aarzhang', // Replace with your actual Cal.com username
  defaultEventSlug: '30min' // Replace with your default event slug
};

const CalendarConfigContext = createContext<CalendarConfig>(defaultConfig);

export function useCalendarConfig() {
  return useContext(CalendarConfigContext);
}

interface CalendarConfigProviderProps {
  children: ReactNode;
  config?: Partial<CalendarConfig>;
}

export function CalendarConfigProvider({
  children,
  config = {}
}: CalendarConfigProviderProps) {
  const mergedConfig = { ...defaultConfig, ...config };

  return (
    <CalendarConfigContext.Provider value={mergedConfig}>
      {children}
    </CalendarConfigContext.Provider>
  );
}
