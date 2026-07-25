function Card({ className = '', children, padding = true, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-warm
        ${padding ? 'p-4' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

function CardImage({ src, alt, className = '' }) {
  return (
    <div className={`aspect-[4/3] overflow-hidden rounded-2xl ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = 'https://placehold.co/400x300/FFEFDD/1F1B24?text=Munch';
        }}
      />
    </div>
  );
}

Card.Image = CardImage;

export default Card;

