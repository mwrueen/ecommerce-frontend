import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetPermissionsQuery,
  useAssignPermissionsToRoleMutation,
  useGetRolePermissionsQuery,
} from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

const RoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const { data: roleData } = useGetRoleQuery(id, { skip: !isEditing });
  const { data: permissionsData } = useGetPermissionsQuery({});
  const { data: rolePermissionsData } = useGetRolePermissionsQuery(id, { skip: !isEditing });

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [assignPermissions] = useAssignPermissionsToRoleMutation();

  useEffect(() => {
    if (roleData?.data) {
      const role = roleData.data;
      setFormData({
        name: role.name,
        slug: role.slug,
        description: role.description || '',
        is_active: role.is_active,
      });
    }
  }, [roleData]);

  useEffect(() => {
    if (rolePermissionsData?.data) {
      const permissionIds = rolePermissionsData.data.map((p: any) => p.id);
      setSelectedPermissions(permissionIds);
    }
  }, [rolePermissionsData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name' && !isEditing) {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllInGroup = (permissions: any[]) => {
    const permissionIds = permissions.map((p) => p.id);
    const allSelected = permissionIds.every((id) => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !permissionIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...permissionIds])]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let roleId = id;

      if (isEditing) {
        await updateRole({ id, ...formData }).unwrap();
      } else {
        const result = await createRole(formData).unwrap();
        roleId = result.data.id;
      }

      // Assign permissions
      if (roleId) {
        await assignPermissions({
          roleId,
          permissionIds: selectedPermissions,
        }).unwrap();
      }

      toast({
        title: 'Success',
        description: `Role ${isEditing ? 'updated' : 'created'} successfully`,
      });
      navigate('/admin/roles');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} role`,
        variant: 'destructive',
      });
    }
  };

  // Group permissions by group
  const groupedPermissions = permissionsData?.data?.reduce((acc: any, permission: any) => {
    const group = permission.group || 'other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {}) || {};

  const isLoading = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/roles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Edit Role' : 'Create Role'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update role details and permissions' : 'Create a new role and assign permissions'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Basic information about the role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., manager"
                  required
                  disabled={isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the role and its responsibilities"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Assign permissions to this role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedPermissions).map(([group, permissions]: [string, any]) => (
              <div key={group} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold capitalize text-foreground">
                    {group.replace('_', ' ')}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllInGroup(permissions)}
                  >
                    {permissions.every((p: any) => selectedPermissions.includes(p.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permissions.map((permission: any) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="grid gap-1 leading-none">
                        <label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {permission.name}
                        </label>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/roles')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
