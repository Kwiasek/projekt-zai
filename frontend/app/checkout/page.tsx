"use client";

import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/fetchApi";
import { useRouter } from "next/navigation";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Placeholder for Stripe Public Key - replace with your actual key in .env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { accessToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    // Payment succeeded on Stripe's end, now finalize order on our backend
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      await fetchApi("/api/order", {
        method: "POST",
        body: JSON.stringify({ items: orderItems }),
        token: accessToken || undefined
      });

      clearCart();
      router.push("/profile?success=true");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Order placement failed after payment. Please contact support.");
      }
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-destructive text-sm">{error}</div>}
      <Button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full rounded-full h-12 text-lg font-semibold"
      >
        {processing ? "Processing..." : "Pay and Place Order"}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCartStore();
  const { user, accessToken } = useAuthStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.push("/products");
      return;
    }

    // In a real app, you would fetch the PaymentIntent client secret from your backend
    const getPaymentIntent = async () => {
        try {
            const orderItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }));

            const data = await fetchApi("/api/create-payment-intent", { 
                method: "POST",
                body: JSON.stringify({ items: orderItems }),
                token: accessToken || undefined
            });
            
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            }
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch payment intent", e);
            setLoading(false);
        }
    };

    getPaymentIntent();
  }, [items, router, accessToken]);

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
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" placeholder="123 Computer St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Silicon Valley" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" placeholder="00-000" />
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
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm />
                </Elements>
              ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Stripe Payment Intent would be initialized here. 
                        To use real Stripe, provide `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and implement backend endpoint.
                    </p>
                    <Button 
                        onClick={async () => {
                            // Simulation of order placement for prototype purposes without real Stripe secret
                            try {
                                const orderItems = items.map(item => ({
                                    productId: item.id,
                                    quantity: item.quantity
                                }));

                                await fetchApi("/api/order", {
                                    method: "POST",
                                    body: JSON.stringify({ items: orderItems }),
                                    token: useAuthStore.getState().accessToken || undefined
                                });

                                useCartStore.getState().clearCart();
                                router.push("/profile?success=true");
                            } catch (err) {
                                if (err instanceof Error) alert(err.message);
                            }
                        }}
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
