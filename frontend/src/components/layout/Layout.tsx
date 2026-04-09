import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/',       label: 'Apply Now' },
    { to: '/status', label: 'Track Application' },
    { to: '/admin',  label: 'Admin' },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMobile}>
            <img src="/logo.png" alt="MLF KYC" className="h-9 w-9 rounded-lg object-contain" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-brand-800">MicroLoan Foundation</p>
              <p className="text-xs text-gray-400 font-medium">KYC Verification Portal</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${location.pathname === link.to
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-brand-700 hover:bg-brand-50'}
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 pb-3 pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobile}
                className={`
                  block w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${location.pathname === link.to
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'}
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-4 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-gray-400">
          <span className="text-center">
            © {new Date().getFullYear()} MicroLoan Foundation Zimbabwe
          </span>
          <span className="text-gray-300">KYC Portal v1.0</span>
        </div>
      </footer>
    </div>
  );
}
