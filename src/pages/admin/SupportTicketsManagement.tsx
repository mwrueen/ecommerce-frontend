import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllSupportTicketsQuery, useGetSupportTicketStatsQuery, useGetPublicSettingsQuery } from '@/hooks/useApi';
import { Search, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function SupportTicketsManagement() {
  const navigate = useNavigate();
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
    page: 1,
    per_page: 15,
  });

  const { data, isLoading } = useGetAllSupportTicketsQuery(filters);
  const { data: statsData } = useGetSupportTicketStatsQuery({});
  const tickets = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

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
    <>
      <Helmet>
        <title>Support Tickets - {settings?.meta_title || settings?.title || ''} - Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-2">Manage customer support requests</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.open}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.in_progress}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unread by Admin</p>
                    <p className="text-2xl font-bold text-red-500">{stats.unread_by_admin}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>

              <Select value={filters.status || undefined} onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority || undefined} onValueChange={(value) => setFilters({ ...filters, priority: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category || undefined} onValueChange={(value) => setFilters({ ...filters, category: value, page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setFilters({
                  status: '',
                  priority: '',
                  category: '',
                  search: '',
                  page: 1,
                  per_page: 15,
                })}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No tickets found</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ticket.customer && (
                            <div>
                              <p className="font-medium">{ticket.customer.name}</p>
                              <p className="text-sm text-muted-foreground">{ticket.customer.email}</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.assigned_admin ? ticket.assigned_admin.name : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>{ticket.message_count}</span>
                            {!ticket.is_admin_read && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/support-tickets/${ticket.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
