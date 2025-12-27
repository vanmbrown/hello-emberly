'use client';

import Link from 'next/link';
import copy from '@/content/copy.json';

export default function Footer() {
  return (
    <footer className="border-t border-foreground/10 mt-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-foreground/60 mb-4">
          {copy.footer.brandAnchor}
        </p>
        <nav className="flex justify-center gap-6">
          <Link
            href="/privacy"
            className="text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 rounded"
          >
            {copy.footer.privacyLink}
          </Link>
          <Link
            href="/guide"
            className="text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 rounded"
          >
            {copy.footer.guideLink}
          </Link>
          <Link
            href="/contact"
            className="text-foreground/70 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 rounded"
          >
            {copy.footer.contactLink}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

