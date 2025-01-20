'use server';
import { createClient } from '@/utils/supabase/server';

export async function createTodo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const title = formData.get('title');
  const category_id = +formData.get('category_id')!;
  const user_id = user?.id;

  await supabase.from('todos').insert({ title, category_id, user_id });
}

export async function getCategories() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name');
  return categories;
}

export async function getTodos() {
  const supabase = await createClient();
  const { data: todos } = await supabase
    .from('todos')
    .select('id, title, completed, category:categories(id, name)');
  return todos;
}

export async function updateTodo(id: string, payload: any) {
  const supabase = await createClient();
  await supabase.from('todos').update(payload).eq('id', id);
}