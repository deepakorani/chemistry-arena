'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Beaker, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/leaderboard', label: 'Leaderboards' },
  { href: '/arena', label: 'Arena' },
  { href: '/evals', label: 'Evals' },
  { href: '/methodology', label: 'Methodology' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-chem-primary to-chem-secondary rounded-xl flex items-center justify-center shadow-lg shadow-chem-primary/20 group-hover:shadow-chem-primary/40 transition-shadow duration-300">
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-chem-accent rounded-full animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Chemistry<span className="text-chem-primary">Arena</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/arena" className="btn-primary text-sm">
              Start Battle
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-chem-muted hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-chem-border">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 px-4 rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'text-chem-primary bg-chem-primary/10'
                    : 'text-chem-muted hover:text-white hover:bg-chem-surface'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 px-4">
              <Link href="/arena" className="btn-primary w-full text-center block">
                Start Battle
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
