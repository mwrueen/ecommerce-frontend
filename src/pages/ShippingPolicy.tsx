import { useGetShippingPolicyQuery } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ShippingPolicy = () => {
  const { data, isLoading } = useGetShippingPolicyQuery({});

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const policy = data?.data?.shipping_policy;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Shipping Policy</CardTitle>
          {data?.data?.last_updated && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(data.data.last_updated).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {policy ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: policy }}
            />
          ) : (
            <p className="text-muted-foreground">Shipping Policy not available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingPolicy;
