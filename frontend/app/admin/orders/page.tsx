"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useAuthStore } from "@/components/auth-store-provider";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchApi("/api/orders", { token: accessToken || undefined });
        setOrders(data);
      } catch (e) {
        console.error("Failed to load orders", e);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [accessToken]);

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
                      <Badge variant={order.status === "PAID" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
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
