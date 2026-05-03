import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Instagram, Mail, Youtube } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container flex h-[var(--header-height)] items-center px-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/" className="text-xl font-semibold">
              <span className="font-bold">WeDoDare</span>
            </Link>
          </div>
          <div className="flex items-center justify-end gap-4">
            <nav className="flex items-center gap-4 mr-2">
              <Link href="/" className="hover:text-primary font-medium">
                홈
              </Link>
              <Link href="/about" className="hover:text-primary font-medium">
                소개
              </Link>
            </nav>
            <div className="flex items-center gap-3 mr-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <ThemeToggle />
            {/* <Button asChild size="sm" className="gap-2">
              <Link href="/blog/write">글쓰기</Link>
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  );
}
