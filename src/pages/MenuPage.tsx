import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Menu from '../components/Menu';

const HERO_VIDEO_ID = "kg218cqrg7hzg0ghqj531aqpy180haz8" as any;

export default function MenuPage() {
  const videoUrl = useQuery(api.files.getUrl, { storageId: HERO_VIDEO_ID });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {videoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              aria-label="Vidéo de préparation de kebab"
              className="hidden md:block w-full h-full object-cover"
              key={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 bg-dark-950" />
          )}
          <img
            src="https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Kebab background"
            className="md:hidden w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/65 via-dark-900/65 to-dark-900/65" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8 md:pt-0">
          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-3 tracking-wide uppercase">
            Notre Carte
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light">
            Découvrez nos spécialités authentiques
          </p>
        </div>
      </section>

      <Menu reducedTopPadding={true} />
    </div>
  );
}
