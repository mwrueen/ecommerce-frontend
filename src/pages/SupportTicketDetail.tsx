import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetSupportTicketQuery, useSendMessageMutation, useGetPublicSettingsQuery } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, User, UserCog, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function SupportTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;

  const { data, isLoading, refetch } = useGetSupportTicketQuery(Number(id));
  const ticket = data?.ticket;

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [message, setMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  // Refetch every 10 seconds to get new messages
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
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading ticket...</p>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Ticket not found</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>
          {ticket.subject} - Support Ticket - {settings?.meta_title || settings?.title || ''}
        </title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/support-tickets')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Button>

        {/* Ticket Header */}
        <Card className="mb-6">
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
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className={statusColors[ticket.status]}>
                {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={priorityColors[ticket.priority]}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
              </Badge>
              {ticket.assigned_admin && (
                <Badge variant="outline">
                  Assigned to: {ticket.assigned_admin.name}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                Created: {format(new Date(ticket.created_at), 'PPP')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Status Alert */}
        {ticket.status === 'resolved' && (
          <Alert className="mb-6 border-green-500/20 bg-green-500/10">
            <AlertCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">
              This ticket has been marked as resolved. Send a message to reopen it.
            </AlertDescription>
          </Alert>
        )}

        {ticket.status === 'closed' && (
          <Alert className="mb-6 border-gray-500/20 bg-gray-500/10">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <AlertDescription className="text-gray-500">
              This ticket is closed. No new messages can be sent.
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
              {ticket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender_type === 'customer' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.sender_type === 'customer'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary/10 text-secondary'
                  }`}>
                    {msg.sender_type === 'customer' ? <User className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
                  </div>

                  <div className={`flex-1 ${msg.sender_type === 'customer' ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {msg.sender_type === 'customer' ? msg.customer?.name : msg.admin?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), 'PPp')}
                      </span>
                    </div>

                    <div className={`inline-block rounded-lg px-4 py-2 ${
                      msg.sender_type === 'customer'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2">
                        {msg.attachments.map((attachment, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2">
                            {attachment}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {ticket.status !== 'closed' && (
          <Card>
            <CardHeader>
              <CardTitle>Send Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSending || !message.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
