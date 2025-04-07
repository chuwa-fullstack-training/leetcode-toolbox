'use server';
import graphqlClient from '@/lib/graphql';
import { createClient } from '@/utils/supabase/server';
import { QueryData } from '@supabase/supabase-js';

export async function updateUserLCInfo(sessionStr: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('leetcode')
    .update({ sessionStr })
    .eq('leetcode_id', user!.id);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

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

export async function saveLeetcodeSession(leetcodeId: string, session: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not found');
  }

  const profileQuery = supabase
    .from('profile')
    .select('firstname,lastname')
    .eq('user_id', user.id)
    .single();
  type Profile = QueryData<typeof profileQuery>;
  const { data, error: profileError } = await profileQuery;
  if (profileError) {
    throw new Error(profileError.message);
  }
  const { firstname, lastname } = data as Profile;

  const { data: existingRecord, error: existingError } = await supabase
    .from('leetcode')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    // PGRST116 indicates no rows found; ignore it
    throw new Error(existingError.message);
  }

  if (existingRecord) {
    const { error: updateError } = await supabase
      .from('leetcode')
      .update({
        leetcode_id: leetcodeId,
        sessionStr: session,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    // Insert a new record
    const { error: insertError } = await supabase.from('leetcode').insert({
      leetcode_id: leetcodeId,
      user_id: user.id,
      name: `${firstname} ${lastname}`,
      sessionStr: session,
      updated_at: new Date().toISOString()
    });
    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

export async function checkExisting(name: string, leetcodeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leetcode')
    .select('*')
    .eq('name', name)
    .eq('leetcode_id', leetcodeId);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function userProgressQuestionList(
  filters: Record<string, string | number>,
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

export async function getLeetcodeProgress(id: string) {
  try {
    const supabase = await createClient();
    const { data: user } = await supabase
      .from('leetcode')
      .select('name,sessionStr')
      .eq('id', id)
      .single();
    const { data: result } = await userProgressQuestionList(
      { skip: 0, limit: 50 },
      user?.sessionStr
    );
    return {
      name: user?.name,
      questions: result.userProgressQuestionList.questions,
      totalNum: result.userProgressQuestionList.totalNum
    };
  } catch (error) {
    throw new Error('Error fetching LeetCode progress');
  }
}
