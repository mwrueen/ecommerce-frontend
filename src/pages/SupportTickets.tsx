import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useGetCustomerTicketsQuery, useGetPublicSettingsQuery } from '@/hooks/useApi';
import { MessageSquare, Plus, Search, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function SupportTickets() {
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
    page: 1,
    per_page: 10,
  });

  const { data, isLoading } = useGetCustomerTicketsQuery(filters);
  const tickets = data?.data || [];
  const pagination = data?.pagination;

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

  return (
    <Layout>
      <Helmet>
        <title>Support Tickets - {settings?.meta_title || settings?.title || ''}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground mt-2">Manage your support requests</p>
          </div>
          <Button asChild>
            <Link to="/support-tickets/create">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status || filters.priority || filters.category
                  ? 'Try adjusting your filters'
                  : "You haven't created any support tickets yet"}
              </p>
              <Button asChild>
                <Link to="/support-tickets/create">Create Your First Ticket</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link to={`/support-tickets/${ticket.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {ticket.subject}
                            </h3>
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {ticket.ticket_number}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                            {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            <span>{ticket.message_count} messages</span>
                          </div>
                          {!ticket.is_customer_read && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              New Reply
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        {ticket.assigned_admin && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: <span className="font-medium">{ticket.assigned_admin.name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.last_page}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
