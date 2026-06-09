"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/useApi";
import { API_BASE_URL } from "@/lib/fetchApi";
import { useAuthStore } from "@/components/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Search, 
  Edit2, 
  X,
  Package,
  AlertCircle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  description: string;
  category?: Category;
  attributes?: Record<string, string>;
  images?: { id: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const api = useApi();
  const { accessToken } = useAuthStore();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stockQuantity: "",
    description: "",
    categoryId: ""
  });

  const [formAttributes, setFormAttributes] = useState<{ key: string, value: string }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api("/api/products?size=100"),
        api("/api/categories")
      ]);
      setProducts(productsData.content);
      setCategories(categoriesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      stockQuantity: "",
      description: "",
      categoryId: ""
    });
    setFormAttributes([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      description: product.description || "",
      categoryId: product.category?.id.toString() || ""
    });
    
    // Convert Record<string, string> to array for form
    const attrs = product.attributes 
      ? Object.entries(product.attributes).map(([key, value]) => ({ key, value }))
      : [];
    setFormAttributes(attrs);
    setIsFormOpen(true);
  };

  const addAttribute = () => {
    setFormAttributes([...formAttributes, { key: "", value: "" }]);
  };

  const updateAttribute = (index: number, field: "key" | "value", value: string) => {
    const newAttrs = [...formAttributes];
    newAttrs[index][field] = value;
    setFormAttributes(newAttrs);
  };

  const removeAttribute = (index: number) => {
    setFormAttributes(formAttributes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingProduct ? `/api/product/${editingProduct.id}` : "/api/product";
    const method = editingProduct ? "PUT" : "POST";

    // Convert array back to Record
    const attributesRecord: Record<string, string> = {};
    formAttributes.forEach(attr => {
      if (attr.key.trim()) {
        attributesRecord[attr.key.trim()] = attr.value;
      }
    });

    try {
      await api(endpoint, {
        method,
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
          description: formData.description,
          category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null,
          attributes: attributesRecord
        })
      });
      setIsFormOpen(false);
      loadData();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api(`/api/product/${id}`, {
        method: "DELETE"
      });
      loadData();
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
      loadData();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your computer parts catalog and stock levels.</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex items-center relative max-w-sm">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search products or categories..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isFormOpen && (
        <Card className="border-primary/20 bg-primary/5 shadow-lg animate-in fade-in zoom-in duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{editingProduct ? "Edit Product" : "Add New Computer Part"}</CardTitle>
              <CardDescription>Enter the technical specifications and pricing.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. NVIDIA RTX 5090" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem'
                  }}
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="" className="bg-popover text-popover-foreground">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-popover text-popover-foreground">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    placeholder="1999.99" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    required 
                    value={formData.stockQuantity} 
                    onChange={e => setFormData({...formData, stockQuantity: e.target.value})} 
                    placeholder="10" 
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="desc">Technical Description</Label>
                <Input 
                  id="desc" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Clock speed, VRAM, TDP..." 
                />
              </div>

              <div className="space-y-4 md:col-span-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Technical Specifications</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                    <Plus className="h-4 w-4 mr-2" /> Add Specification
                  </Button>
                </div>
                
                {formAttributes.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-muted/50 rounded-lg border border-dashed">
                    No technical specifications added yet.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {formAttributes.map((attr, index) => (
                    <div key={index} className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-200">
                      <div className="flex-1 space-y-1">
                        <Input 
                          placeholder="Key (e.g. Socket)" 
                          value={attr.key}
                          onChange={e => updateAttribute(index, "key", e.target.value)}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Input 
                          placeholder="Value (e.g. AM5)" 
                          value={attr.value}
                          onChange={e => updateAttribute(index, "value", e.target.value)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeAttribute(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-3 md:col-span-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Update Product" : "Save Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-muted-foreground/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="group">
                <TableCell>
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center relative overflow-hidden ring-1 ring-border group-hover:ring-primary/50 transition-all">
                    {product.images && product.images.length > 0 ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={`${API_BASE_URL}/api/image/${product.images[0].id}`} className="object-cover h-full w-full" alt="" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground/20" />
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      title="Upload product image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(product.id, file);
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {product.description || "No description"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <Badge variant="secondary" className="font-normal">
                      {product.category.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  ${product.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.stockQuantity < 5 ? "destructive" : "outline"} className="w-12 justify-center">
                      {product.stockQuantity}
                    </Badge>
                    {product.stockQuantity < 5 && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleOpenEdit(product)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground/60">Try adjusting your search or add a new product.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
