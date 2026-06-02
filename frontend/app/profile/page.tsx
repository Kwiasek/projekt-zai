"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/components/auth-store-provider";
import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, User as UserIcon, CheckCircle2 } from "lucide-react";

interface Order {
  id: number;
  status: string;
  items: {
    id: number;
    priceAtPurchase: number;
    quantity: number;
    product: { name: string };
  }[];
}

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
}

export default function ProfilePage() {
  const { user, accessToken, setAuth, _hasHydrated } = useAuthStore((state) => state);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [details, setDetails] = useState<UserDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    birthDate: ""
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [ordersData, userData] = await Promise.all([
          fetchApi("/api/orders", { token: accessToken || undefined }),
          fetchApi("/api/user", { token: accessToken || undefined })
        ]);
        
        setOrders(ordersData);
        if (userData.userDetails) {
          setDetails({
            firstName: userData.userDetails.firstName || "",
            lastName: userData.userDetails.lastName || "",
            email: userData.userDetails.email || "",
            phoneNumber: userData.userDetails.phoneNumber || "",
            birthDate: userData.userDetails.birthDate || ""
          });
        }
      } catch (e) {
        console.error("Failed to load profile data", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, accessToken, router]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      await fetchApi("/api/user/details", {
        method: "PUT",
        body: JSON.stringify(details),
        token: accessToken || undefined
      });

      // Update the global store with new user details
      const freshUser = await fetchApi("/api/user", { token: accessToken || undefined });
      setAuth(freshUser, accessToken!);
      
      setMessage("Profile updated successfully!");
    } catch (err) {
      if (err instanceof Error) setMessage(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading your profile...</p>
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <UserIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and track orders.</p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-100">
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="details">My Details</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {orders.length === 0 ? (
            <Card className="border-dashed py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Package className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-semibold">No orders yet</h3>
                <p className="text-muted-foreground mb-6">Your hardware purchase history will appear here.</p>
                <Button onClick={() => router.push("/products")} variant="outline">Start Shopping</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden border-muted-foreground/10 hover:border-muted-foreground/20 transition-colors">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription>Placed successfully</CardDescription>
                      </div>
                      <Badge variant={order.status === "PAID" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex gap-2">
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold">Total</span>
                        <span className="text-primary font-bold text-lg">
                          ${order.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your contact details and shipping preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateDetails} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={details.firstName} 
                      onChange={e => setDetails({...details, firstName: e.target.value})} 
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={details.lastName} 
                      onChange={e => setDetails({...details, lastName: e.target.value})} 
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={details.email} 
                      onChange={e => setDetails({...details, email: e.target.value})} 
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={details.phoneNumber} 
                      onChange={e => setDetails({...details, phoneNumber: e.target.value})} 
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth">Birth Date</Label>
                    <Input 
                      id="birth" 
                      type="date" 
                      value={details.birthDate} 
                      onChange={e => setDetails({...details, birthDate: e.target.value})} 
                    />
                  </div>
                </div>

                {message && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${message.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                    {!message.startsWith('Error') && <CheckCircle2 className="h-4 w-4" />}
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                )}

                <Button type="submit" disabled={updating} className="w-full md:w-auto px-8">
                  {updating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                  ) : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
