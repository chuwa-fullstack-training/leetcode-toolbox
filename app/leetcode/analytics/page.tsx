'use client';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { userProgressQuestionList } from '../action';
import LeetCodeAnalysis from './component';

export default function LeetcodeAnalytics() {
  const params = useSearchParams();
  const userId = params.get('id');
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('leetcode')
      .select('sessionStr')
      .eq('id', userId)
      .then(({ data }) =>
        userProgressQuestionList(
          {
            skip: 0,
            limit: 50
          },
          data?.[0]?.sessionStr
        )
      )
      .then(
        ({
          data: {
            userProgressQuestionList: { questions }
          }
        }) => {
          setProgress(questions);
          setIsLoading(false);
        }
      );
  }, [userId]);

  return (
    <div className="container mx-auto py-10 w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        progress && <LeetCodeAnalysis progress={progress} />
      )}
    </div>
  );
}
