import { useSearchParams, Navigate } from 'react-router-dom';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search') || searchParams.get('query') || searchParams.get('q') || '';

  return <Navigate to={query ? `/products?search=${encodeURIComponent(query)}` : '/products'} replace />;
}
