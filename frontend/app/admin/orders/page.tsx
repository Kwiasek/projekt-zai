"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Order {
  id: number;
  status: string;
  createdAt: string;
  user: { username: string };
  items: {
    priceAtPurchase: number;
    quantity: number;
    product: { name: string };
  }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const api = useApi();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await api("/api/orders");
        setOrders(data);
      } catch (e) {
        console.error("Failed to load orders", e);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [api]);

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) || 
    order.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.id - a.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">View and manage customer orders.</p>
      </div>

      <div className="flex items-center relative max-w-sm">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by ID or username..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-muted-foreground/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const total = order.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.user.username}</TableCell>
                    <TableCell>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {order.items.map(i => i.product.name).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${total.toFixed(2)}</TableCell>
                    <TableCell>
                      <select
                        className="bg-input/50 text-foreground border border-transparent rounded-3xl p-1 px-3 text-xs focus:ring-3 focus:ring-ring/30 focus:border-ring transition-all appearance-none cursor-pointer pr-8"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '0.8rem'
                        }}
                        value={order.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await api(`/api/order/${order.id}/status`, {
                              method: "PUT",
                              body: JSON.stringify({ status: newStatus })
                            });
                            // Update local state
                            setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                          } catch (err) {
                            if (err instanceof Error) alert(err.message);
                          }
                        }}
                      >
                        <option value="PENDING" className="bg-popover text-popover-foreground">PENDING</option>
                        <option value="PAID" className="bg-popover text-popover-foreground">PAID</option>
                        <option value="SHIPPED" className="bg-popover text-popover-foreground">SHIPPED</option>
                        <option value="DELIVERED" className="bg-popover text-popover-foreground">DELIVERED</option>
                        <option value="CANCELLED" className="bg-popover text-popover-foreground">CANCELLED</option>
                      </select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
