import { useGetUserStatsQuery } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, ShoppingCart, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading } = useGetUserStatsQuery({});

  const metrics = [
    {
      title: 'Total Users',
      value: stats?.data?.total_users || 0,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Active Users',
      value: stats?.data?.active_users || 0,
      icon: Users,
      color: 'text-secondary',
    },
    {
      title: 'New This Month',
      value: stats?.data?.new_this_month || 0,
      icon: ShoppingCart,
      color: 'text-accent',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.data?.total_revenue || 0}`,
      icon: DollarSign,
      color: 'text-primary',
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
