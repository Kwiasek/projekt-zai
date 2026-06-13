"use client";

import { loadStripe } from "@stripe/stripe-js";
import { 
  PaymentElement, 
  CheckoutElementsProvider,
  useCheckoutElements
} from "@stripe/react-stripe-js/checkout";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/components/auth-store-provider";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import Link from "next/link"

// Placeholder for Stripe Public Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const appearance = {
  theme: "night" as const,
  labels: "above" as const,
  variables: {
    colorBackground: "#18181b",
    colorPrimary: "#fff",
    borderRadius: "24px"
  }
};

interface DeliveryData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
}

function CheckoutForm({ 
  deliveryData, 
  userEmail, 
  stripeSessionId 
}: { 
  deliveryData: DeliveryData; 
  userEmail: string; 
  stripeSessionId: string | null; 
}) {
  const checkout = useCheckoutElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const api = useApi();

  const validateDelivery = () => {
    if (!deliveryData.firstName || !deliveryData.lastName || !deliveryData.address || !deliveryData.city || !deliveryData.zip) {
      setError("Please fill in all delivery information fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkout || checkout.type !== 'success') return;

    if (!validateDelivery()) return;

    setProcessing(true);
    setError(null);

    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      // If confirmation succeeded, we place the order record in our DB
      await api("/api/order", {
        method: "POST",
        body: JSON.stringify({ 
          items: orderItems,
          status: "PENDING",
          stripeSessionId: stripeSessionId
        })
      });

      // Confirm payment using the new checkout.confirm method (Stripe will redirect the browser)
      const { error: confirmError } = await (checkout.checkout.confirm({
        returnUrl: window.location.origin + "/profile?success=true&session_id={CHECKOUT_SESSION_ID}",
        email: userEmail
      }) as any);

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setProcessing(false);
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Something went wrong.");
      }
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</div>}
      <Button 
        type="submit" 
        disabled={processing} 
        className="w-full rounded-full h-12 text-lg font-semibold"
      >
        {processing ? "Processing..." : "Pay and Place Order"}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCartStore();
  const { user, _hasHydrated } = useAuthStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const api = useApi();

  const [deliveryData, setDeliveryData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: ""
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRedirectingToProfile, setIsRedirectingToProfile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    if (items.length === 0 && !clientSecret && !isRedirectingToProfile) {
      router.push("/products");
      return;
    }

    const getCheckoutSession = async () => {
        try {
            const orderItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }));

            const [paymentData, userData] = await Promise.all([
                api("/api/create-payment-intent", { 
                    method: "POST",
                    body: JSON.stringify({ items: orderItems })
                }),
                api("/api/user")
            ]);
            
            if (paymentData.clientSecret) {
                setClientSecret(paymentData.clientSecret);
            }
            if (paymentData.sessionId) {
                setStripeSessionId(paymentData.sessionId);
            }
            if (userData?.userDetails?.email) {
                setUserEmail(userData.userDetails.email);
            }
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch checkout session", e);
            setLoading(false);
        }
    };

    getCheckoutSession();
  }, [items, router, api, mounted, _hasHydrated]);

  if (!mounted || !_hasHydrated) {
    return (
        <div className="container mx-auto py-20 px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
        <Link href="/login">
          <Button className="rounded-full px-8">Sign In</Button>
        </Link>
      </div>
    );
  }

  const handleSimulatedPayment = async () => {
    if (!deliveryData.firstName || !deliveryData.lastName || !deliveryData.address || !deliveryData.city || !deliveryData.zip) {
      setValidationError("Please fill in all delivery information fields.");
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      await api("/api/order", {
        method: "POST",
        body: JSON.stringify({ 
          items: orderItems,
          status: "PAID"
        })
      });

      setIsRedirectingToProfile(true);
      useCartStore.getState().clearCart();
      router.push("/profile?success=true");
    } catch (err) {
      if (err instanceof Error) alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    value={deliveryData.firstName}
                    onChange={e => setDeliveryData({...deliveryData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    value={deliveryData.lastName}
                    onChange={e => setDeliveryData({...deliveryData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input 
                  id="address" 
                  placeholder="123 Computer St" 
                  value={deliveryData.address}
                  onChange={e => setDeliveryData({...deliveryData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Silicon Valley" 
                    value={deliveryData.city}
                    onChange={e => setDeliveryData({...deliveryData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input 
                    id="zip" 
                    placeholder="00-000" 
                    value={deliveryData.zip}
                    onChange={e => setDeliveryData({...deliveryData, zip: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/10 border-primary/20">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-10 text-center">Initializing payment...</div>
              ) : clientSecret ? (
                <CheckoutElementsProvider stripe={stripePromise} options={{ clientSecret, elementsOptions: { appearance } } as any}>
                  <CheckoutForm deliveryData={deliveryData} userEmail={userEmail} stripeSessionId={stripeSessionId} />
                </CheckoutElementsProvider>
              ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Stripe Checkout Session would be initialized here. 
                        To use real Stripe, provide `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and implement backend endpoint.
                    </p>
                    {validationError && <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 mb-4">{validationError}</div>}
                    <Button 
                        onClick={handleSimulatedPayment}
                        className="w-full rounded-full h-12 text-lg font-semibold"
                    >
                        Simulate Payment & Place Order
                    </Button>
                </div>
              )}
              
              <div className="mt-6 flex justify-between items-center text-lg font-bold">
                <span>Total to Pay:</span>
                <span className="text-primary text-2xl">${getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

