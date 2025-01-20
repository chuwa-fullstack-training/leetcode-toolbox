import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>You are not logged in</div>;
  }

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title')
    .eq('user_id', user?.id);

  return notes && notes.length > 0 ? (
    <pre>{JSON.stringify(notes, null, 2)}</pre>
  ) : (
    <div>No notes for the current user found</div>
  );
}

// 'use client'

// import { createClient } from '@/utils/supabase/client'
// import { useEffect, useState } from 'react'

// export default function Page() {
//   const [notes, setNotes] = useState<any[] | null>(null)
//   const supabase = createClient()

//   useEffect(() => {
//     const getData = async () => {
//       const { data } = await supabase.from('notes').select()
//       setNotes(data)
//     }
//     getData()
//   }, [])

//   return <pre>{JSON.stringify(notes, null, 2)}</pre>
// }
