"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/fetchApi";
import { useAuthStore } from "@/components/auth-store-provider";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Package
} from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  lowStockProducts: number;
  salesData: { date: string; amount: number }[];
  categoryData: { name: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi("/api/admin/stats", { token: accessToken || undefined });
        setStats(data);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [accessToken]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Lifetime earnings",
      color: "text-green-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      description: "Successful transactions",
      color: "text-blue-500",
    },
    {
      title: "Active Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      description: "Registered accounts",
      color: "text-purple-500",
    },
    {
      title: "Low Stock",
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      description: "Items needing restock",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">Monitor your store&apos;s performance and inventory.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <Card key={i} className="border-muted-foreground/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sales Trend
            </CardTitle>
            <CardDescription>Daily revenue performance</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Inventory Distribution
            </CardTitle>
            <CardDescription>Products by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
