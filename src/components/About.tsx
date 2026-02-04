import { CheckCircle } from 'lucide-react';
import { highlights } from '../data/about-data';

export default function About() {
  return (
    <section id="apropos" className="py-20 relative overflow-hidden" style={{ backgroundColor: '#f2eadc' }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary-600 font-extrabold mb-2">À Propos</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 leading-none tracking-wide uppercase">
              Frais, Chaud<br />
              & Fait avec Amour!
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Pour tous les amateurs de kebab passionnés, Snack Karadeniz est là pour vous. Explorez nos délicieuses recettes nos grillades, nos brochettes en passant par nos kebabs ou nos galettes.
              <br /><br />
              Tous nos ingrédients sont frais et de première qualité, garantissant une expérience gustative incomparable.
              <br /><br />
              Disponible sur UberEats !
            </p>

            <ul className="space-y-4 mb-8">
              {highlights.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{item}</span>
                </li>
              ))}
            </ul>


          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <img
                src="https://images.pexels.com/photos/1482803/pexels-photo-1482803.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Notre cuisine"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-500/20 rounded-3xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary-500/20 rounded-3xl -z-10" />
            </div>

            <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-4xl font-bold text-primary-500 mb-1">25+</p>
              <p className="text-gray-700 font-medium">Annees d'experience</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
