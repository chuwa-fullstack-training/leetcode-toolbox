'use server';
import graphqlClient from '@/lib/graphql';
import { createClient } from '@/utils/supabase/server';

export async function getLeetcodeSession(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leetcode')
    .select('sessionStr')
    .eq('leetcode_id', userId)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data.sessionStr;
}

export async function saveLeetcodeSession(
  email: string,
  leetcodeId: string,
  session: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('leetcode')
    .insert({ email, leetcode_id: leetcodeId, sessionStr: session });
  if (error) {
    throw new Error(error.message);
  }
}

export async function userProgressQuestionList(
  filters: {
    [key: string]: string | number;
  },
  session: string
) {
  const query = `
query userProgressQuestionList($filters: UserProgressQuestionListInput) {
  userProgressQuestionList(filters: $filters) {
    totalNum
    questions {
      translatedTitle
      frontendId
      title
      titleSlug
      difficulty
      lastSubmittedAt
      numSubmitted
      questionStatus
      lastResult
      topicTags {
        name
        nameTranslated
        slug
      }
    }
  }
}`;

  const requestBody = {
    operationName: 'userProgressQuestionList',
    query,
    variables: { filters },
    session
  };

  const options = {
    data: requestBody
  };

  const response = await graphqlClient(options);

  return response.data;
}
