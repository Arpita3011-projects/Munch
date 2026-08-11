import { useMemo } from 'react';
import MenuItemCard from '../components/domain/MenuItemCard';
import Skeleton from '../components/ui/Skeleton';
import { useMenu } from '../hooks/useMenu';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

/**
 * Home / Discovery page.
 *
 * Clean, premium dessert-ordering layout (Starbucks / McDonald's / Uber Eats style):
 *  - Compact hero (~20–25% of page height): light cream background with a
 *    SUBTLE pink gradient, short greeting + store name on the left, a single
 *    dessert image on the right (~40% of hero width). No giant pink block.
 *  - Large search bar immediately below the hero.
 *  - Category chips directly beneath the search, same content width.
 *  - "Popular Picks" grid (5 cards per row on desktop, generous spacing).
 *  - Slim, compact feature strip (ingredients / love / delivery / fresh).
 *  - "More To Explore" grid with the remaining items (no duplication).
 *  - max-w-[1500px] container with minimal side margins.
 *
 * All filtering, search, pagination, favorites, and auth logic is
 * preserved exactly — this is a presentation-only redesign.
 */
export default function HomePage() {
  const {
    items, categories, pagination, loading, error, isWakingUp,
    search, selectedCategory, changeSearch, changeCategory, changePage,
  } = useMenu();

const { isFavorite, toggleFavorite } = useFavorites();
  const { user, isAuthenticated } = useAuth();

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'foodie';

  const hasActiveFilters = search || selectedCategory;
  const showEmptyState = !loading && !error && !isWakingUp && items.length === 0;
  const showErrorState = !loading && error && !isWakingUp;
  const showPagination = !loading && !error && !isWakingUp && pagination.totalPages > 1;

  const itemsLabel = pagination.total || items.length || 0;

  // Split the current (filtered) items into two sections — no duplication.
  const popularItems = items.slice(0, 10);
  const moreItems = items.slice(10);

  // Hero image reuses the first menu item so it always looks real.
  const heroImage = items[0]?.image;

  // 5 cards per row on desktop, fewer on smaller screens.
  const gridClass =
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5';

  const scrollToMore = () => {
    document.getElementById('more-to-explore')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const FEATURES = [
    {
      title: 'Premium Ingredients',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10l1.5 4.5L15 10l-1.5 4.5" />
        </svg>
      ),
    },
    {
      title: 'Made with Love',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ),
    },
    {
      title: 'Fast Delivery',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Fresh & Delicious',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-2 md:pt-3 pb-10">
      <div className="max-w-[1500px] mx-auto">
        {/* ══════════ 1 · COMPACT HERO (~130px mobile / ~145px desktop) ══════════ */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-cream via-white to-brand-pink/10 border border-brand-cream-2 shadow-warm mb-3">
          <div className="relative h-[130px] md:h-[145px]">
            {/* Left: greeting + store name + short subtitle (65%) */}
            <div className="relative z-10 flex flex-col justify-center h-full px-4 md:px-6 pr-[26%] md:pr-8">
              <span className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-full w-max">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.5 5.5a1.5 1.5 0 012.83-.001L16.5 7.5a1.5 1.5 0 010 2.68l-3.17 2-3.17 2a1.5 1.5 0 01-1.5 0l-3.17-2-3.17-2a1.5 1.5 0 010-2.68l3.17-2A1.5 1.5 0 0110.5 5.5z" opacity="0.75" />
                  <path d="M12 23c3.866 0 7-3.134 7-7V7c0-.552-.448-1-1-1h-1c-.552 0-1 .448-1 1v9c0 .552-.448 1-1 1s-1-.448-1-1V6.5c0-.552-.448-1-1-1s-1 .448-1 1V16c0 .552-.448 1-1 1s-1-.448-1-1V7c0-.552-.448-1-1-1H5c-.552 0-1 .448-1 1v9c0 3.866 3.134 7 7 7z" opacity="0.55" />
                </svg>
                The Yard Milkshake Bar
              </span>
              <h1 className="font-display font-extrabold text-brand-charcoal text-lg sm:text-xl md:text-3xl leading-none mt-1">
                {greeting}
                <span className="block text-brand-charcoal/80 text-xs sm:text-sm md:text-[15px] mt-0.5">
                  What's your dessert craving today?
                </span>
              </h1>
            </div>

            {/* Right: single dessert image (~22% width) */}
            <div className="absolute inset-y-0 right-0 w-[24%] md:w-[22%]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="Signature dessert"
className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 ${heroImage ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-brand-cream to-brand-pink/5`}>
                <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-pink/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z" />
                  </svg>
                </div>
              </div>
              {/* Subtle left fade to blend into the cream gradient */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-brand-cream/60 md:to-brand-cream/25" aria-hidden="true" />
            </div>
          </div>
        </section>

{/* ══════════ 2 · SEARCH BAR (nearly full width, rounded-full) ══════════ */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search milkshakes, sundaes, coffee..."
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            className="w-full h-[52px] md:h-14 pl-12 pr-12 bg-white rounded-full border border-brand-charcoal/10 text-sm text-brand-charcoal placeholder:text-brand-charcoal/30 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all shadow-warm"
            aria-label="Search menu items"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={() => changeSearch('')}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-brand-charcoal/30 hover:text-brand-charcoal/60 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <nav className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar mb-4" aria-label="Menu categories">
            <div className="flex gap-2 min-w-max">
              <button type="button" onClick={() => changeCategory('')}
                className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${!selectedCategory ? 'bg-brand-pink text-white shadow-sm' : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:border-brand-charcoal/20 hover:text-brand-charcoal'}`}
                aria-pressed={!selectedCategory}>All</button>
              {categories.map((cat) => (
                <button key={cat} type="button" onClick={() => changeCategory(cat)}
                  className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${selectedCategory === cat ? 'bg-brand-pink text-white shadow-sm' : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:border-brand-charcoal/20 hover:text-brand-charcoal'}`}
                  aria-pressed={selectedCategory === cat}>{cat}</button>
              ))}
            </div>
          </nav>
        )}

        {/* ══════════ LOADING / ERROR / EMPTY STATES ══════════ */}
        {isWakingUp && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-pink/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l-2.25 2.25m0 0l-2.25-2.25m2.25 2.25V4.5" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-display font-semibold text-brand-charcoal mb-1">Starting Munch...</p>
            <p className="text-sm text-brand-charcoal/50 mb-6">The server is waking up. This may take a moment on the first visit.</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-pink/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-brand-pink/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-brand-pink/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {loading && !isWakingUp && (
          <div className={gridClass}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-warm">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 md:p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center justify-between pt-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showErrorState && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-brand-charcoal/60 mb-1">Something went wrong</p>
            <p className="text-sm text-brand-charcoal/40 mb-4">{error}</p>
            <button type="button" onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]">Try Again</button>
          </div>
        )}

        {showEmptyState && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-charcoal/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-brand-charcoal/60 mb-1">{hasActiveFilters ? 'No items found' : 'Menu is empty'}</p>
            <p className="text-sm text-brand-charcoal/40 mb-4">{hasActiveFilters ? 'Try adjusting your search or filter' : 'Check back later for new items'}</p>
            {hasActiveFilters && (
              <button type="button" onClick={() => { changeSearch(''); changeCategory(''); }}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]">Clear Filters</button>
            )}
          </div>
        )}

        {/* ══════════ 4 · POPULAR PICKS ══════════ */}
        {!loading && !error && !isWakingUp && popularItems.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-brand-charcoal">
                  Popular Picks
                </h2>
                <p className="text-xs md:text-sm text-brand-charcoal/50 mt-0.5">
                  {hasActiveFilters
                    ? `${itemsLabel} matching item${itemsLabel !== 1 ? 's' : ''}`
                    : 'Most-loved treats, handpicked for you'}
                </p>
              </div>
              {moreItems.length > 0 && (
                <button
                  type="button"
                  onClick={scrollToMore}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-pink hover:text-brand-pink-dark transition-colors min-h-[44px] cursor-pointer"
                >
                  See All
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}
            </div>

            <div className={gridClass}>
              {popularItems.map((item) => (
                <MenuItemCard key={item._id} item={item} isFavorite={isFavorite(item._id)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════ 5 · SLIM FEATURE STRIP ══════════ */}
        {!loading && !error && !isWakingUp && items.length > 0 && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-3xl bg-gradient-to-r from-brand-cream-2/50 to-brand-cream/50 border border-brand-cream-2/40 p-3.5 md:p-4 mb-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-sm border border-brand-cream-2/50 flex items-center justify-center text-brand-pink flex-shrink-0">
                  {feature.icon}
                </div>
                <p className="text-[11px] md:text-xs font-semibold text-brand-charcoal leading-snug">
                  {feature.title}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* ══════════ 6 · MORE TO EXPLORE ══════════ */}
        {!loading && !error && !isWakingUp && moreItems.length > 0 && (
          <section id="more-to-explore" className="scroll-mt-20 mb-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-brand-charcoal">
                More To Explore
              </h2>
            </div>

            <div className={gridClass}>
              {moreItems.map((item) => (
                <MenuItemCard key={item._id} item={item} isFavorite={isFavorite(item._id)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════ PAGINATION ══════════ */}
        {showPagination && (
          <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Menu pagination">
            <button type="button" onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-charcoal/10 text-brand-charcoal/50 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
              aria-label="Previous page">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" onClick={() => changePage(p)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${p === pagination.page ? 'bg-brand-pink text-white shadow-sm' : 'text-brand-charcoal/50 hover:text-brand-charcoal hover:bg-brand-charcoal/5'}`}
                aria-label={`Page ${p}`} aria-current={p === pagination.page ? 'page' : undefined}>{p}</button>
            ))}
            <button type="button" onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-charcoal/10 text-brand-charcoal/50 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
              aria-label="Next page">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </nav>
        )}
        {!loading && !error && items.length > 0 && (
          <p className="text-center text-xs text-brand-charcoal/30 mt-3">
            Showing {items.length} of {pagination.total} items
            {pagination.totalPages > 1 && ` — Page ${pagination.page} of ${pagination.totalPages}`}
          </p>
        )}
      </div>
    </div>
  );
}

