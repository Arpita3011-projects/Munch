import { useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';

export default function OrderDetailPage() {
  const { id } = useParams();

  return (
    <PageContainer>
      <h1 className="text-2xl font-display font-bold text-brand-charcoal mb-6">Order #{id}</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-brand-charcoal/60">Order tracking will appear here.</p>
      </div>
    </PageContainer>
  );
}

