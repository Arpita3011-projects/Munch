import { useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';

export default function ItemDetailPage() {
  const { id } = useParams();

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-xl font-display font-bold text-brand-charcoal mb-2">
          Item Details
        </h1>
        <p className="text-brand-charcoal/60">
          Viewing item: {id}
        </p>
      </div>
    </PageContainer>
  );
}

