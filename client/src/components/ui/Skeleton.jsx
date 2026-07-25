function Skeleton({ className = '', variant = 'rect', width, height }) {
  const base = 'skeleton';
  const isCircular = variant === 'circle';

  return (
    <div
      className={`
        ${base}
        ${isCircular ? 'rounded-full' : 'rounded-2xl'}
        ${className}
      `.trim()}
      style={{
        width: width || '100%',
        height: height || (isCircular ? width || '48px' : '16px'),
      }}
      aria-hidden="true"
    />
  );
}

function MenuItemCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-warm overflow-hidden animate-fade-in">
      <Skeleton className="aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

Skeleton.MenuItemCard = MenuItemCardSkeleton;

export default Skeleton;

