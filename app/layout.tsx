import { EnvVarWarning } from '@/components/env-var-warning';
import HeaderAuth from '@/components/header-auth';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { hasEnvVars } from '@/utils/supabase/check-env-vars';
import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Chuwa Leetcode Toolbox',
  description: 'A toolbox for Leetcode progress tracking'
};

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin']
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 z-10 backdrop-blur-sm bg-background/10">
            <nav className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
              <div className="flex gap-5 items-center font-semibold">
                <Link href={'/leetcode'}>Leetcode Toolbox</Link>
              </div>
              <ThemeSwitcher />
              {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
            </nav>
          </header>
          <main className="flex flex-col items-center grow">{children}</main>
          <footer className="w-full flex flex-col items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-left max-w-1/3">
                <h4 className="font-bold text-sm">About Us</h4>
                <p className="text-xs">
                  Chuwa Leetcode Toolbox is your companion for tracking and
                  improving your coding skills.
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Contact</h4>
                <p className="text-xs">
                  Email: react.training@chuwaamerica.com
                </p>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Follow Us</h4>
                <p className="text-xs">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Twitter
                  </a>
                  <span className="mx-2">|</span>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    LinkedIn
                  </a>
                </p>
              </div>
            </div>
            {/* <p className="text-xs mt-8">
              Powered by{' '}
              <a
                href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
              >
                Supabase
              </a>
            </p> */}
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
