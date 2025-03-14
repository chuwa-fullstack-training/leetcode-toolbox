import { createClient } from '@/utils/supabase/server';
import { userProgressQuestionList } from '../action';

export async function getUserProgressQuestionList(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
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
    );

  return data;
}
