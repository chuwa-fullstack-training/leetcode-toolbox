import Hero from '@/components/hero';
import Link from 'next/link';

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col px-4">
        <h2 className="font-medium text-xl mb-2">Next steps</h2>
        <ol className="list-inside list-[upper-roman]">
          <li>
            <Link href="/sign-up" className="font-bold hover:underline">
              Sign up
            </Link>{' '}
            first
          </li>
          <li>
            <Link href="/sign-in" className="font-bold hover:underline">
              Sign in
            </Link>{' '}
            your account
          </li>
          <li>
            Go to{' '}
            <Link href="/leetcode" className="font-bold hover:underline">
              Leetcode
            </Link>{' '}
            page to submit your session
          </li>
        </ol>
      </main>
    </>
  );
}
