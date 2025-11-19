import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateSupportTicketMutation, useGetPublicSettingsQuery } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send } from 'lucide-react';

export default function CreateSupportTicket() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;

  const [createTicket, { isLoading }] = useCreateSupportTicketMutation();

  const [formData, setFormData] = useState<{
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'order' | 'product' | 'account' | 'other';
  }>({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'other',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const result = await createTicket(formData).unwrap();
      toast({
        title: 'Success',
        description: result.message,
      });
      navigate(`/support-tickets/${result.ticket.id}`);
    } catch (error: any) {
      if (error.data?.errors) {
        setErrors(error.data.errors);
      }
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create ticket',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Support Ticket - {settings?.meta_title || settings?.title || ''}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/support-tickets')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>
              Describe your issue and our support team will get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as typeof formData.category })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing & Payment</SelectItem>
                    <SelectItem value="order">Order Issues</SelectItem>
                    <SelectItem value="product">Product Issues</SelectItem>
                    <SelectItem value="account">Account Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as typeof formData.priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait</SelectItem>
                    <SelectItem value="medium">Medium - Normal</SelectItem>
                    <SelectItem value="high">High - Important</SelectItem>
                    <SelectItem value="urgent">Urgent - Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide detailed information about your issue..."
                  rows={8}
                  required
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description[0]}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Minimum 10 characters. Please be as detailed as possible.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create Ticket'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/support-tickets')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
