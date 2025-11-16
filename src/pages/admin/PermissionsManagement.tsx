import { useState } from 'react';
import { Shield, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetPermissionsQuery } from '@/hooks/useApi';

const PermissionsManagement = () => {
  const [search, setSearch] = useState('');

  const { data: permissionsData, isLoading } = useGetPermissionsQuery({
    search,
  });

  // Group permissions by group
  const groupedPermissions = permissionsData?.data?.reduce((acc: any, permission: any) => {
    const group = permission.group || 'other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Permissions
        </h1>
        <p className="text-muted-foreground mt-1">
          View all available permissions in the system
        </p>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(groupedPermissions).map(([group, permissions]: [string, any]) => (
            <Card key={group}>
              <CardHeader>
                <CardTitle className="capitalize">{group.replace('_', ' ')}</CardTitle>
                <CardDescription>
                  {permissions.length} permission{permissions.length !== 1 ? 's' : ''} in this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {permissions.map((permission: any) => (
                    <div
                      key={permission.id}
                      className="p-4 border rounded-lg space-y-2 bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{permission.name}</h3>
                          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                            {permission.slug}
                          </code>
                        </div>
                        {permission.is_active ? (
                          <Badge variant="default" className="shrink-0">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">Inactive</Badge>
                        )}
                      </div>
                      {permission.description && (
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && Object.keys(groupedPermissions).length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No permissions found</p>
        </div>
      )}
    </div>
  );
};

export default PermissionsManagement;
