import PageContainer from '../components/layout/PageContainer';

export default function CheckoutPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Checkout</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-brand-charcoal/60">Checkout will be available once items are in your cart.</p>
      </div>
    </PageContainer>
  );
}

