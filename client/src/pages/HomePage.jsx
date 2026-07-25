import { useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import MenuItemCard from '../components/domain/MenuItemCard';
import Skeleton from '../components/ui/Skeleton';
import { useMenu } from '../hooks/useMenu';

/**
 * Home / Discovery page.
 *
 * Features:
 * - Sticky header with greeting and location
 * - Search bar with debounced input
 * - Horizontal category chips
 * - Responsive menu grid (2 cols mobile, 3 cols tablet, 4 cols desktop)
 * - Loading skeletons
 * - Empty state
 * - Pagination
 */
export default function HomePage() {
  const {
    items,
    categories,
    pagination,
    loading,
    error,
    search,
    selectedCategory,
    changeSearch,
    changeCategory,
    changePage,
  } = useMenu();

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const hasActiveFilters = search || selectedCategory;
  const showEmptyState = !loading && !error && items.length === 0;
  const showErrorState = !loading && error;
  const showPagination = !loading && !error && pagination.totalPages > 1;

  return (
    <>
      {/* Sticky header section */}
      <div className="sticky top-14 z-20 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-charcoal/5">
        <PageContainer className="pb-3 pt-3">
          {/* Greeting and location */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-display font-bold text-brand-charcoal">
                {greeting}
              </h1>
              <p className="text-sm text-brand-charcoal/50 flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                The Yard Milkshake Bar
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search milkshakes, sundaes, coffee..."
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white rounded-full border border-brand-charcoal/10 text-sm text-brand-charcoal placeholder:text-brand-charcoal/30 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all"
              aria-label="Search menu items"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={() => changeSearch('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-charcoal/30 hover:text-brand-charcoal/60 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category chips — horizontal scroll */}
          {categories.length > 0 && (
            <nav className="mt-3 -mx-4 px-4 overflow-x-auto scrollbar-hide" aria-label="Menu categories">
              <div className="flex gap-2 pb-1 min-w-max">
                <button
                  type="button"
                  onClick={() => changeCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 ${
                    !selectedCategory
                      ? 'bg-brand-pink text-white shadow-sm'
                      : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:border-brand-charcoal/20 hover:text-brand-charcoal'
                  }`}
                  aria-pressed={!selectedCategory}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => changeCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 ${
                      selectedCategory === cat
                        ? 'bg-brand-pink text-white shadow-sm'
                        : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:border-brand-charcoal/20 hover:text-brand-charcoal'
                    }`}
                    aria-pressed={selectedCategory === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </PageContainer>
      </div>

      {/* Main content */}
      <PageContainer>
        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-warm">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {showErrorState && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-brand-charcoal/60 mb-1">Something went wrong</p>
            <p className="text-sm text-brand-charcoal/40 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-charcoal/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-brand-charcoal/60 mb-1">
              {hasActiveFilters ? 'No items found' : 'Menu is empty'}
            </p>
            <p className="text-sm text-brand-charcoal/40 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search or filter'
                : 'Check back later for new items'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  changeSearch('');
                  changeCategory('');
                }}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Menu grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {showPagination && (
              <nav className="flex items-center justify-center gap-2 mt-8 pb-4" aria-label="Menu pagination">
                <button
                  type="button"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-charcoal/10 text-brand-charcoal/50 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => changePage(p)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                      p === pagination.page
                        ? 'bg-brand-pink text-white shadow-sm'
                        : 'text-brand-charcoal/50 hover:text-brand-charcoal hover:bg-brand-charcoal/5'
                    }`}
                    aria-label={`Page ${p}`}
                    aria-current={p === pagination.page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-charcoal/10 text-brand-charcoal/50 hover:text-brand-charcoal hover:border-brand-charcoal/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </nav>
            )}

            {/* Results summary */}
            <p className="text-center text-xs text-brand-charcoal/30 mt-4 pb-4">
              Showing {items.length} of {pagination.total} items
              {pagination.totalPages > 1 && ` — Page ${pagination.page} of ${pagination.totalPages}`}
            </p>
          </>
        )}
      </PageContainer>
    </>
  );
}

