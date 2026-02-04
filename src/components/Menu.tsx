import { useState, useRef, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import MenuItem from './MenuItem';

interface MenuProps {
  showHeader?: boolean;
  reducedTopPadding?: boolean;
  reducedHeaderSpacing?: boolean;
}

export default function Menu({ showHeader = false, reducedTopPadding = false, reducedHeaderSpacing = false }: MenuProps) {
  const categoryRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const hasUserInteracted = useRef(false);

  const menuCategories = useQuery(api.queries.getMenuCategories);
  const allMenuItems = useQuery(api.queries.getMenuItems);

  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    if (menuCategories && menuCategories.length > 0 && !activeCategory) {
      setActiveCategory(menuCategories[0].slug);
    }
  }, [menuCategories, activeCategory]);

  const filteredItems = allMenuItems?.filter(item => item.category === activeCategory && item.active) || [];

  useEffect(() => {
    if (!hasUserInteracted.current) {
      return;
    }

    const activeButton = categoryRefs.current.get(activeCategory);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeCategory]);

  const setCategoryRef = (id: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      categoryRefs.current.set(id, element);
    } else {
      categoryRefs.current.delete(id);
    }
  };

  return (
    <section id="menu" className={`pb-20 bg-white ${reducedTopPadding ? 'pt-[42px]' : 'pt-20'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className={`text-center ${reducedHeaderSpacing ? 'mb-8' : 'mb-16'}`}>
            <p className="text-red-500 font-display text-lg tracking-wide uppercase mb-2">
              Découvrez
            </p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-dark-900 uppercase tracking-wide">
              Notre Carte
            </h2>
          </div>
        )}

        {!menuCategories ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des catégories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto mb-12 -mx-4 px-4 sm:mx-0 sm:px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-3 justify-start sm:justify-center min-w-max sm:min-w-0 sm:flex-wrap">
              {menuCategories.map((category) => (
                <button
                  key={category.slug}
                  ref={setCategoryRef(category.slug)}
                  onClick={() => {
                    hasUserInteracted.current = true;
                    setActiveCategory(category.slug);
                  }}
                  className={`font-display text-lg tracking-wide px-4 py-3 rounded-full transition-all uppercase whitespace-nowrap ${
                    activeCategory === category.slug
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-red-100 text-gray-700 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {!allMenuItems ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucun article dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <MenuItem key={item._id} item={item} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <a
            href="#contact"
            className="font-display text-xl tracking-wide inline-flex items-center px-8 py-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 uppercase"
          >
            Commander Maintenant
          </a>
        </div>
      </div>
    </section>
  );
}
