"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuthStore } from "@/components/auth-store-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, User as UserIcon, CheckCircle2 } from "lucide-react";
import { useApi } from "@/lib/useApi"
import { useCartStore } from "@/lib/cartStore"
import { API_BASE_URL } from "@/lib/fetchApi"

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

function ProfilePageContent() {
  const { user, accessToken, setAuth, _hasHydrated } = useAuthStore((state) => state);
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useApi();
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
  const [mounted, setMounted] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const { clearCart } = useCartStore();

  const sessionId = searchParams.get("session_id");
  const success = searchParams.get("success");
  const ref = searchParams.get("ref");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (success === "true" && sessionId && ref !== "clean") {
      window.location.replace(window.location.pathname + "?success=true&session_id=" + sessionId + "&ref=clean");
    }
  }, [success, sessionId, ref]);

  useEffect(() => {
    if (success === "true") {
      clearCart();
    }
  }, [success, clearCart]);

  useEffect(() => {
    if (!mounted || !_hasHydrated || !sessionId) return;
    if (success === "true" && ref !== "clean") return;

    const verifyPayment = async () => {
      setVerifyingPayment(true);
      try {
        const response = await api(`/api/payment/verify?sessionId=${sessionId}`);
        if (response && (response.status === "PAID" || response.status === "SUCCESS")) {
          // reload orders
          const ordersData = await api("/api/orders");
          setOrders(ordersData);
        }
      } catch (err) {
        console.error("Verification error:", err);
      } finally {
        setVerifyingPayment(false);
        // Clean URL parameters
        const params = new URLSearchParams(window.location.search);
        params.delete("session_id");
        params.delete("success");
        params.delete("ref");
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        router.replace(newUrl);
      }
    };

    verifyPayment();
  }, [sessionId, success, ref, mounted, _hasHydrated, api, router]);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    if (success === "true" && sessionId && ref !== "clean") return;

    if (!user) {
      router.push("/login");
      return;
    }
    // ... rest of useEffect

    const loadData = async () => {
      try {
        const [ordersData, userData] = await Promise.all([
          api("/api/orders"),
          api("/api/user")
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
  }, [user, api, router, _hasHydrated, mounted]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      await api("/api/user/details", {
        method: "PUT",
        body: JSON.stringify(details)
      });

      // Update the global store with new user details
      const freshUser = await api("/api/user");
      setAuth(freshUser, accessToken!);
      
      setMessage("Profile updated successfully!");
    } catch (err) {
      if (err instanceof Error) setMessage(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (!mounted || !_hasHydrated || loading) return (
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

      {verifyingPayment && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm text-foreground">Verifying payment status...</p>
            <p className="text-xs text-muted-foreground">Please wait a moment while we confirm your payment with Stripe.</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:max-w-md h-11">
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
                <Card key={order.id} className="overflow-hidden border-muted-foreground/10 hover:border-muted-foreground/20 transition-all duration-300 pt-0 pb-0 gap-0">
                  <CardHeader className="bg-muted/30 py-4 px-6 border-b border-muted-foreground/10">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <CardTitle className="text-lg font-bold">Order #{order.id}</CardTitle>
                        <CardDescription className="text-xs">Placed successfully</CardDescription>
                      </div>
                      <Badge variant={order.status === "PAID" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex gap-2">
                            <span className="font-medium text-foreground">{item.product.name}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold text-foreground">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-foreground">Total</span>
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

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
