"use client";

import { useState, useEffect } from "react";
import { fetchApi, API_BASE_URL } from "@/lib/fetchApi";
import { useAuthStore } from "@/components/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  category?: { name: string };
  images?: { id: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { user, accessToken, _hasHydrated } = useAuthStore((state) => state);
  const router = useRouter();

  // New Product Form State
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newDesc, setNewDescription] = useState("");

  const loadProducts = async () => {
    try {
      const data = await fetchApi("/api/products?size=100");
      setProducts(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    
    console.log(user)
    if (!user || user.role !== "ROLE_ADMIN") {
      router.push("/");
      return;
    }
    loadProducts();
  }, [user, router, _hasHydrated]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/api/product", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          price: parseFloat(newPrice),
          stockQuantity: parseInt(newStock),
          description: newDesc
        }),
        token: accessToken || undefined
      });
      setIsAdding(false);
      setNewName("");
      setNewPrice("");
      setNewStock("");
      setNewDescription("");
      loadProducts();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetchApi(`/api/product/${id}`, {
        method: "DELETE",
        token: accessToken || undefined
      });
      loadProducts();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleImageUpload = async (productId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayOrder", "0");

    try {
      const response = await fetch(`${API_BASE_URL}/api/product/${productId}/image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");
      loadProducts();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading inventory...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Product</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-10 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New Computer Part</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. NVIDIA RTX 5090" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" step="0.01" required value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="1999.99" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" required value={newStock} onChange={e => setNewStock(e.target.value)} placeholder="10" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" value={newDesc} onChange={e => setNewDescription(e.target.value)} placeholder="Technical specifications..." />
              </div>
              <Button type="submit" className="md:col-span-2">Save Product</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-muted-foreground/10 hover:border-muted-foreground/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-6">
              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={`${API_BASE_URL}/api/image/${product.images[0].id}`} className="object-cover h-full w-full" alt="" />
                ) : (
                  <ImageIcon className="text-muted-foreground/20" />
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(product.id, file);
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">${product.price.toFixed(2)}</Badge>
                  <Badge variant={product.stockQuantity < 5 ? "destructive" : "secondary"}>
                    {product.stockQuantity} in stock
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
