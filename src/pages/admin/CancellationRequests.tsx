import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetPendingCancellationsQuery,
  useApproveCancellationMutation,
  useRejectCancellationMutation,
} from '@/store/api/ordersApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/currency';
import { format } from 'date-fns';
import { Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';

const CancellationRequests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const { data: settings } = useGetPublicSettingsQuery({});
  const { data, isLoading } = useGetPendingCancellationsQuery({
    search,
    page,
    per_page: 20,
  });
  const [approveCancellation, { isLoading: isApproving }] = useApproveCancellationMutation();
  const [rejectCancellation, { isLoading: isRejecting }] = useRejectCancellationMutation();

  const handleApprove = async (orderId: number) => {
    try {
      await approveCancellation(orderId).unwrap();
      toast({
        title: 'Cancellation Approved',
        description: 'Order has been cancelled and stock released.',
      });
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error?.data?.message || 'Failed to approve cancellation',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    try {
      await rejectCancellation({
        id: selectedOrder.id,
        admin_note: rejectNote,
      }).unwrap();
      toast({
        title: 'Cancellation Rejected',
        description: 'The cancellation request has been rejected.',
      });
      setShowRejectDialog(false);
      setRejectNote('');
      setSelectedOrder(null);
    } catch (error: any) {
      toast({
        title: 'Rejection Failed',
        description: error?.data?.message || 'Failed to reject cancellation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cancellation Requests</h1>
        <p className="text-muted-foreground">Review and manage pending order cancellation requests</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by order number, customer name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
          ) : !data?.data?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending cancellation requests found
            </div>
          ) : (
            <div className="space-y-4">
              {data.data.map((order: any) => (
                <Card key={order.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{order.order_number}</h3>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Review
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            Customer: <span className="text-foreground">{order.customer?.name}</span>
                            {' • '}
                            {order.customer?.email}
                          </p>
                          <p className="text-muted-foreground">
                            Order Total: <span className="font-semibold text-foreground">
                              {formatPrice(
                                order.total_amount,
                                settings?.data?.currency_symbol,
                                settings?.data?.currency_position,
                                settings?.data?.formatted_currency
                              )}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Requested: {format(new Date(order.cancellation_requested_at), 'PPP p')}
                          </p>
                          {order.cancellation_reason && (
                            <div className="mt-2 p-2 bg-muted rounded-md">
                              <p className="text-sm">
                                <span className="font-medium">Reason:</span> {order.cancellation_reason}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="text-xs text-muted-foreground">
                            {order.order_items?.length || 0} item(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(order.id)}
                          disabled={isApproving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRejectDialog(true);
                          }}
                          disabled={isRejecting}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {data.pagination && data.pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} of {data.pagination.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === data.pagination.last_page}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Cancellation Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this cancellation request. The customer will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOrder && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-semibold">{selectedOrder.order_number}</p>
                <p className="text-muted-foreground">{selectedOrder.customer?.name}</p>
              </div>
            )}
            <div>
              <Textarea
                placeholder="Explain why this request is being rejected..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {rejectNote.length}/1000 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CancellationRequests;
