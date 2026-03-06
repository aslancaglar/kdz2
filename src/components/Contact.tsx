"use client";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import FadeIn from './FadeIn';

export default function Contact() {
  const restaurantInfo = useQuery(api.restaurantInfo.get);

  if (!restaurantInfo) {
    return (
      <section id="contact" className="py-20 bg-warm-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-warm-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-primary-700 font-semibold mb-2">Contactez-nous</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 mb-6 tracking-wide uppercase">
              Nous Trouver
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Venez nous rendre visite ou passez commande par téléphone. Nous serons ravis de vous accueillir !
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-12">
          <FadeIn delay={200} className="grid md:grid-cols-2 gap-8">
            {/* Box 1 : Coordonnées */}
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Adresse</h3>
                  <p className="text-gray-600 whitespace-pre-line mt-1">{restaurantInfo.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Téléphone</h3>
                  <a href={`tel:${restaurantInfo.phone?.replace(/\s/g, '')}`} className="text-gray-600 hover:text-primary-500 transition-colors mt-1 block">
                    {restaurantInfo.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="break-all">
                  <h3 className="text-lg font-bold text-gray-900">Email</h3>
                  <a href={`mailto:${restaurantInfo.email}`} className="text-gray-600 hover:text-primary-500 transition-colors mt-1 block">
                    {restaurantInfo.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Box 2 : Horaires */}
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-500 flex-shrink-0 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Horaires</h3>
              </div>
              <div className="space-y-3">
                {restaurantInfo.hours?.map((h, index) => (
                  <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="font-semibold text-gray-800">{h.day}</span>
                    <span className="text-gray-600 text-right">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={400} className="relative w-full h-[400px] lg:h-[500px]">
            <div className="absolute inset-0 bg-gray-200 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2600.8052602173807!2d6.1141143!3d49.317971500000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4795258664a86ccf%3A0x8db9ac174343560f!2sSnack%20Karadeniz%20Florange!5e0!3m2!1sfr!2sfr!4v1770294381690!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Karadeniz Restaurant Location"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
