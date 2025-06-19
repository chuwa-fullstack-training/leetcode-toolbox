'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLeetcodeProgress } from '../action';
import LeetCodeAnalysis from './component';

export default function Page() {
  const params = useSearchParams();
  const userId = params.get('id');
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getLeetcodeProgress(userId!)
      .then(data => {
        setProgress(data.questions);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching LeetCode progress:', error);
        setIsLoading(false);
      });
  }, [userId]);

  return (
    <div className="container mx-auto py-10 w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 dark:border-white" />
        </div>
      ) : (
        progress && <LeetCodeAnalysis progress={progress} />
      )}
    </div>
  );
}
