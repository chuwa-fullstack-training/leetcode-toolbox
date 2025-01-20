import { createClient } from "@/utils/supabase/server";
import { createNote } from "./action";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>You are not logged in</div>;
  }

  return (
    <form action={createNote}>
      <input type="text" name="title" placeholder="Title" />
      <button type="submit">Create Note</button>
    </form>
  );
}
