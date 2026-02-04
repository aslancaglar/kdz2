import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, ShoppingBag } from 'lucide-react';
import OrderList from './OrderList';
import { useOrder } from '../context/OrderContext';

const navLinks = [
  { href: '/', label: 'Accueil', type: 'route' as const },
  { href: '#apropos', label: 'A propos', type: 'hash' as const },
  { href: '/menu', label: 'Menu', type: 'route' as const },
  { href: '#avis', label: 'Avis', type: 'hash' as const },
  { href: '#gallery', label: 'Galerie', type: 'hash' as const },
  { href: '#contact', label: 'Contact', type: 'hash' as const },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);
  const { getItemCount } = useOrder();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHashNavigation = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-6 sm:py-3 px-4 sm:px-6 lg:px-8">
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'bg-primary-600 rounded-full shadow-xl' : ''
          }`}
      >
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img
              src="src/assets/images/logo_karadeniz.png.webp"
              alt="Karadeniz Logo"
              className={`w-auto transition-all duration-300 ${isScrolled ? 'h-12' : 'h-20'
                }`}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.type === 'route') {
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="font-display text-lg tracking-wide transition-colors text-white hover:text-white/70 uppercase"
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleHashNavigation(e, link.href)}
                  className="font-display text-lg tracking-wide transition-colors text-white hover:text-white/70 uppercase"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsOrderListOpen(true)}
              className={`relative p-2.5 rounded-full transition-all ${isScrolled
                ? 'bg-white text-primary-600 hover:bg-gray-100'
                : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              aria-label="Voir la commande"
            >
              <ShoppingBag className="w-5 h-5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>

            <a
              href="tel:0382581339"
              className={`inline-flex items-center gap-2 px-6 py-2.5 font-display text-lg tracking-wide rounded-full transition-all shadow-lg hover:shadow-xl ${isScrolled
                ? 'bg-white text-primary-600 hover:bg-gray-100'
                : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
            >
              <Phone className="w-5 h-5" />
              03 82 58 13 39
            </a>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOrderListOpen(true)}
              className="relative p-2 rounded-lg transition-colors text-white"
              aria-label="Voir la commande"
            >
              <ShoppingBag className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg transition-colors text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden mt-2 bg-primary-600 rounded-2xl shadow-xl">
          <nav className="flex flex-col px-4 py-4">
            {navLinks.map((link) => {
              if (link.type === 'route') {
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="py-3 text-white font-display text-lg tracking-wide hover:text-white/70 transition-colors border-b border-white/20 last:border-0 uppercase"
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleHashNavigation(e, link.href);
                  }}
                  className="py-3 text-white font-display text-lg tracking-wide hover:text-white/70 transition-colors border-b border-white/20 last:border-0 uppercase"
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href="tel:0382581339"
              onClick={() => setIsMenuOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-display text-lg tracking-wide rounded-full hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              03 82 58 13 39
            </a>
          </nav>
        </div>
      )}

      <OrderList isOpen={isOrderListOpen} onClose={() => setIsOrderListOpen(false)} />
    </header>
  );
}
