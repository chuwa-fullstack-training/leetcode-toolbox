'use server';

import { createClient } from '@/utils/supabase/server';

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const title = formData.get('title');
  await supabase.from('notes').insert({
    title,
    user_id: user?.id ?? null
  });
}
