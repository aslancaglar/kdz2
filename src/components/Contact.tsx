import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

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

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adresse',
      content: restaurantInfo.address || '',
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: restaurantInfo.phone || '',
      href: restaurantInfo.phone ? `tel:${restaurantInfo.phone.replace(/\s/g, '')}` : undefined,
    },
    {
      icon: Mail,
      title: 'Email',
      content: restaurantInfo.email || '',
      href: restaurantInfo.email ? `mailto:${restaurantInfo.email}` : undefined,
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: restaurantInfo.hours
        ? restaurantInfo.hours.map(h => `${h.day}: ${h.time}`).join('\n')
        : '',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-warm-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary-700 font-semibold mb-2">Contactez-nous</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 mb-6 tracking-wide uppercase">
            Nous Trouver
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Venez nous rendre visite ou passez commande par téléphone. Nous serons ravis de vous accueillir !
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          <div className="grid sm:grid-cols-2 gap-6">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-3xl p-6 shadow-md hover:bg-white hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-gray-600 hover:text-primary-500 transition-colors"
                  >
                    {item.content}
                  </a>
                ) : (
                  <p className="text-gray-600 whitespace-pre-line">{item.content}</p>
                )}
              </div>
            ))}
          </div>

          <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
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
          </div>
        </div>
      </div>
    </section>
  );
}
