export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`px-4 py-4 md:px-6 md:py-6 ${className}`}>
      {children}
    </div>
  );
}

