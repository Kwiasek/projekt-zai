"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Search, 
  Edit2, 
  X,
  Tags
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
  description: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const api = useApi();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const loadCategories = useCallback(async () => {
    try {
      const data = await api("/api/categories");
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ""
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingCategory ? `/api/category/${editingCategory.id}` : "/api/category";
    const method = editingCategory ? "PUT" : "POST";

    try {
      await api(endpoint, {
        method,
        body: JSON.stringify(formData)
      });
      setIsFormOpen(false);
      loadCategories();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This might affect products in this category.")) return;
    try {
      await api(`/api/category/${id}`, {
        method: "DELETE"
      });
      loadCategories();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">Organize your products into logical groups.</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="flex items-center relative max-w-sm">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search categories..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isFormOpen && (
        <Card className="border-primary/20 bg-primary/5 shadow-lg animate-in fade-in zoom-in duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{editingCategory ? "Edit Category" : "Add New Category"}</CardTitle>
              <CardDescription>Give your category a name and optional description.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Graphics Cards" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (Optional)</Label>
                <Input 
                  id="desc" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Details about this category..." 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {editingCategory ? "Update Category" : "Save Category"}
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
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  {category.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {category.description || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleOpenEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredCategories.length === 0 && (
          <div className="p-12 text-center">
            <Tags className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No categories found</h3>
            <p className="text-sm text-muted-foreground/60">Start by adding your first category.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
