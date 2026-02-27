import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeIn from './FadeIn';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[45vh] flex items-center overflow-hidden pt-28 md:pt-28 pb-24"
    >
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-label="Vidéo de préparation de kebab"
          className="hidden md:block w-full h-full object-cover"
        >
          <source src="/kebab-video.mp4" type="video/mp4" />
        </video>
        <img
          src="https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Kebab background"
          className="md:hidden w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/65 via-dark-900/65 to-dark-900/65" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn delay={200} className="max-w-2xl text-left">
            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-wide leading-tight mb-3 text-white uppercase">
              Découvrez le vrai<br />
              <span className="text-secondary-400">goût du kebab</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
              Découvrez le véritable goût du kebab turc. Viandes fraîches, ingrédients de qualité et recettes traditionnelles transmises de génération en génération.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/menu"
                className="font-display text-xl tracking-wide inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 uppercase"
              >
                Voir Notre Menu
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:0382581339"
                className="font-display text-xl tracking-wide inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-dark-900 transition-all"
              >
                <Phone className="w-5 h-5" />
                03 82 58 13 39
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
