import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useGetSupportTicketQuery,
  useSendMessageMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useUpdateTicketPriorityMutation,
  useDeleteSupportTicketMutation,
  useGetPublicSettingsQuery,
  useGetUsersQuery,
} from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ArrowLeft, Send, User, UserCog, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SupportTicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;

  const { data, isLoading, refetch } = useGetSupportTicketQuery(Number(id));
  const ticket = data?.ticket;

  const { data: usersData } = useGetUsersQuery({ role: 'admin', per_page: 100 });
  const adminUsers = usersData?.data || [];

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();
  const [assignTicket] = useAssignTicketMutation();
  const [updatePriority] = useUpdateTicketPriorityMutation();
  const [deleteTicket] = useDeleteSupportTicketMutation();

  const [message, setMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  // Refetch every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;

    try {
      const result = await sendMessage({
        ticketId: Number(id),
        data: { message: message.trim() },
      }).unwrap();

      toast({
        title: 'Success',
        description: result.message,
      });
      setMessage('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;

    try {
      const result = await updateStatus({ id: Number(id), status }).unwrap();
      toast({
        title: 'Success',
        description: result.message,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleAssign = async (adminId: string) => {
    if (!id) return;

    try {
      const result = await assignTicket({ id: Number(id), admin_id: Number(adminId) }).unwrap();
      toast({
        title: 'Success',
        description: result.message,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to assign ticket',
        variant: 'destructive',
      });
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!id) return;

    try {
      const result = await updatePriority({ id: Number(id), priority }).unwrap();
      toast({
        title: 'Success',
        description: result.message,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to update priority',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const result = await deleteTicket(Number(id)).unwrap();
      toast({
        title: 'Success',
        description: result.message,
      });
      navigate('/admin/support-tickets');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to delete ticket',
        variant: 'destructive',
      });
    }
  };

  const statusColors = {
    open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
    closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  const priorityColors = {
    low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-center text-muted-foreground">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ticket not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {ticket.subject} - Support Ticket - {settings?.meta_title || settings?.title || ''} - Admin
        </title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin/support-tickets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>

          {ticket.status === 'closed' && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Ticket
            </Button>
          )}
        </div>

        {/* Ticket Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle>{ticket.subject}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {ticket.ticket_number}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{ticket.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Info */}
            {ticket.customer && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {ticket.customer.name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {ticket.customer.email}</p>
                  {ticket.customer.phone && (
                    <p><span className="text-muted-foreground">Phone:</span> {ticket.customer.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Management */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Badge variant="outline" className="w-full justify-center">
                  {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign To</label>
                <Select value={ticket.assigned_to?.toString() || ''} onValueChange={handleAssign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminUsers.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id.toString()}>
                        {admin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created: {format(new Date(ticket.created_at), 'PPP')}</span>
              {ticket.resolved_at && (
                <span>• Resolved: {format(new Date(ticket.resolved_at), 'PPP')}</span>
              )}
              {ticket.closed_at && (
                <span>• Closed: {format(new Date(ticket.closed_at), 'PPP')}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto p-6 space-y-6">
              {ticket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender_type !== 'admin' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[70%] ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1.5 ${msg.sender_type === 'admin' ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-sm">
                        {msg.sender_type === 'admin' ? msg.admin?.name : msg.customer?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>

                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      msg.sender_type === 'admin'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  </div>

                  {msg.sender_type === 'admin' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                      <UserCog className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {ticket.status !== 'closed' && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Send Reply</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSendMessage} className="space-y-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSending || !message.trim()} size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Ticket"
        description="Are you sure you want to delete this ticket? This action cannot be undone."
      />
    </>
  );
}
