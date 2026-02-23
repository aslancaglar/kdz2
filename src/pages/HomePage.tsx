import Hero from '../components/Hero';
import About from '../components/About';
import Menu from '../components/Menu';
import Reviews from '../components/Reviews';
import Gallery from '../components/Gallery';
import Contact from '../components/Contact';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Menu showHeader={true} reducedHeaderSpacing={true} />
      <Reviews />
      <Gallery />
      <Contact />
    </>
  );
}
