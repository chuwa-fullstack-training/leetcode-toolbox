import Hero from '@/components/hero';
import Link from 'next/link';
// import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
// import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
// import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col px-4">
        <h2 className="font-medium text-xl mb-2">Next steps</h2>
        <div className="flex gap-2">
          Go to{' '}
          <Link href="/leetcode" className="font-bold hover:underline">
            Leetcode
          </Link>{' '}
          page to submit your session
        </div>
        {/* {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />} */}
      </main>
    </>
  );
}
