import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetNavbarCountQuery, useGetNavbarLatestQuery } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

export const SupportTicketDropdown = () => {
  const [open, setOpen] = useState(false);
  const { data: countData } = useGetNavbarCountQuery({}, { pollingInterval: 30000 });
  const { data: ticketsData } = useGetNavbarLatestQuery({ limit: 5 });

  const count = countData?.count || 0;
  const tickets = ticketsData?.data || [];

  const priorityColors = {
    low: 'bg-gray-500/10 text-gray-500',
    medium: 'bg-blue-500/10 text-blue-500',
    high: 'bg-orange-500/10 text-orange-500',
    urgent: 'bg-red-500/10 text-red-500',
  };

  const statusColors = {
    open: 'text-blue-500',
    in_progress: 'text-yellow-500',
    resolved: 'text-green-500',
    closed: 'text-gray-500',
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200"
        >
          <MessageSquare className="h-4 w-4" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-indigo-500 font-bold"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[400px] bg-slate-900 border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-0 z-50"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Support Tickets</h3>
          {count > 0 && (
            <Badge variant="secondary">{count} unread</Badge>
          )}
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No support tickets</p>
          </div>
        ) : (
          <>
            <div className="max-h-[400px] overflow-y-auto">
              {tickets.map((ticket: any) => (
                <Link
                  key={ticket.id}
                  to={`/admin/support-tickets/${ticket.id}`}
                  onClick={() => setOpen(false)}
                >
                  <DropdownMenuItem className="p-4 cursor-pointer">
                    <div className="w-full space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {ticket.ticket_number}
                            </span>
                            {!ticket.is_admin_read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm truncate">{ticket.subject}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`flex-shrink-0 ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={statusColors[ticket.status as keyof typeof statusColors]}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span>{ticket.customer?.name}</span>
                        {ticket.message_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{ticket.message_count} messages</span>
                          </>
                        )}
                      </div>

                      {ticket.latest_message && (
                        <p className="text-xs text-muted-foreground truncate">
                          {ticket.latest_message.message}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}
            </div>
            
            <DropdownMenuSeparator />
            
            <Link to="/admin/support-tickets" onClick={() => setOpen(false)}>
              <DropdownMenuItem className="p-3 cursor-pointer justify-center font-medium">
                View all tickets
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
