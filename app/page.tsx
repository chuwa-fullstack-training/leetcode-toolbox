'use client';

import Particles from '@/components/Backgrounds/Particles/Particles';
import Hero from '@/components/hero';

export default function Home() {
  return (
    <>
      <div className="absolute w-screen h-[calc(100vh-8rem)]">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={256}
          particleSpread={16}
          speed={0.1}
          particleBaseSize={128}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>
      <Hero />
      <main className="flex-1 flex flex-col px-4 mt-4">
        <h2 className="font-medium text-xl mb-2">Next steps</h2>
        <ol className="list-inside list-[upper-roman]">
          <li>
            Wait for the recruiter to send you the invitation via email to sign
            up.
          </li>
          <li>Use the invitation link to finish signing up.</li>
          <li>Log in to submit your LeetCode progress.</li>
        </ol>
      </main>
    </>
  );
}
