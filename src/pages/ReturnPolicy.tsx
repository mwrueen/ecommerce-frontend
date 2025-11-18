import { useGetReturnPolicyQuery } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ReturnPolicy = () => {
  const { data, isLoading } = useGetReturnPolicyQuery({});

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

  const policy = data?.data?.return_policy;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Return Policy</CardTitle>
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
            <p className="text-muted-foreground">Return Policy not available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnPolicy;
