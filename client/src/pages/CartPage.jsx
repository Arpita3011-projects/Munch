import PageContainer from '../components/layout/PageContainer';
import { Link } from 'react-router-dom';

export default function CartPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Cart</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-charcoal/5 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3.75 3.75 0 00-3.75 3.75h15.75M5.25 4.5l1.5 5.25m0 0l1.25 4.5m-1.25-4.5h12.25a1.125 1.125 0 011.082 1.382l-1.5 5.25a1.125 1.125 0 01-1.082.868H7.5m0 0l-1.078 3.75m0 0a1.5 1.5 0 00.703 1.743A1.5 1.5 0 007.5 21a1.5 1.5 0 001.703-.852m-5.203 0A1.5 1.5 0 003 20.25a1.5 1.5 0 001.703.852" />
          </svg>
        </div>
        <p className="text-brand-charcoal/60 mb-4">Your cart is empty</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-pink text-white rounded-full font-medium text-sm hover:bg-brand-pink-dark transition-colors min-h-[44px]"
        >
          Browse Menu
        </Link>
      </div>
    </PageContainer>
  );
}

