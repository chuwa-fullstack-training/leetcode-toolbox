import NextLogo from './next-logo';
import SupabaseLogo from './supabase-logo';
import Image from 'next/image';
import Logo from '@/public/logo_preview.png';
import { cn } from '@/lib/utils';
import SplitText from './TextAnimations/SplitText/SplitText';

export default function Hero({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-16 items-center mt-20', className)}>
      <div className="flex gap-8 justify-center items-center z-10">
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
        >
          <SupabaseLogo />
        </a>
        <span className="border-l rotate-45 h-6" />
        <Image src={Logo} alt="Ryzlink" className="h-[32px] w-[128px]" />
        <span className="border-l rotate-45 h-6" />
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <NextLogo />
        </a>
      </div>
      {/* <p className="text-3xl lg:text-4xl leading-tight! mx-auto max-w-xl text-center z-10">
        Track Progress, Build Confidence, Master Code
      </p> */}
      <SplitText
        text="Track Progress, Build Confidence, Master Code"
        className="text-3xl lg:text-4xl leading-tight! mx-auto max-w-xl text-center z-10"
        ease="elastic.out(1,0.3)"
        splitType="words"
        duration={2}
        delay={200}
      />
      <p className="text-lg lg:text-xl text-muted-foreground mx-auto max-w-2xl text-center z-10 -mt-4">
        Track your LeetCode progress and celebrate every milestone in your
        full-stack development journey.
      </p>

      <div className="w-full p-[1px] bg-linear-to-r from-transparent via-foreground/10 to-transparent mt-8" />
    </div>
  );
}
