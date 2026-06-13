import { fetchApi, API_BASE_URL } from "@/lib/fetchApi";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import Image from "next/image";
import ProductFilters from "@/components/product-filters";
import Pagination from "@/components/pagination";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category?: {
    id: number;
    name: string;
  };
  attributes?: Record<string, string>;
  images?: {
    id: number;
    contentType: string;
    displayOrder: number;
  }[];
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface PaginatedResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? params.page : '0';
  const name = typeof params.name === 'string' ? params.name : '';
  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : '';
  const sort = typeof params.sort === 'string' ? params.sort : '';

  let endpoint = `/api/products?page=${page}&size=12`;
  if (name) endpoint += `&name=${encodeURIComponent(name)}`;
  if (categoryId) endpoint += `&categoryId=${categoryId}`;
  if (sort) endpoint += `&sort=${encodeURIComponent(sort)}`;

  let data: PaginatedResponse | null = null;
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    // Fetch products and categories concurrently
    const [productsRes, categoriesRes] = await Promise.all([
      fetchApi(endpoint, { cache: "no-store" }),
      fetchApi("/api/categories", { cache: "no-store" })
    ]);
    data = productsRes;
    categories = categoriesRes;
  } catch (e) {
    if (e instanceof Error) error = e.message;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-8 border-b pb-6 border-muted-foreground/10">
        <h1 className="text-3xl font-bold tracking-tight">Computer Parts</h1>
        <p className="text-muted-foreground mt-1">
          Browse our high-performance hardware catalog and build your ultimate rig.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl mb-8 border border-destructive/20 animate-in fade-in duration-300">
          Error loading products: {error}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <ProductFilters categories={categories} />

        {/* Products Grid & Pagination */}
        <div className="flex-1">
          {!data || data.content.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center min-h-[400px]">
              <Cpu className="h-16 w-16 text-muted-foreground/40 mb-4 animate-pulse" />
              <p className="text-xl font-bold text-muted-foreground">No products found</p>
              <p className="text-muted-foreground mt-2 max-w-sm">
                We couldn&apos;t find any items matching your criteria. Try adjusting your search term or category filter.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.content.map((product) => (
                  <Card key={product.id} className="flex flex-col h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-muted-foreground/10 group">
                    {/* Image Container */}
                    <Link href={`/products/${product.id}`} className="block relative aspect-square bg-muted/30 overflow-hidden border-b border-muted-foreground/10">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={`${API_BASE_URL}/api/image/${product.images[0].id}`}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Cpu className="h-16 w-16 text-muted-foreground/20" />
                        </div>
                      )}
                      
                      {product.stockQuantity <= 0 && (
                        <Badge variant="destructive" className="absolute top-3 right-3 rounded-full shadow-md">
                          Out of Stock
                        </Badge>
                      )}
                      
                      {product.category && (
                        <Badge variant="secondary" className="absolute top-3 left-3 opacity-90 rounded-full shadow-sm bg-background/80 backdrop-blur-xs">
                          {product.category.name}
                        </Badge>
                      )}
                    </Link>

                    {/* Content Section */}
                    <CardHeader className="p-5 pb-2">
                      <Link href={`/products/${product.id}`}>
                        <CardTitle className="text-lg font-bold line-clamp-1 hover:text-primary transition-colors">
                          {product.name}
                        </CardTitle>
                      </Link>
                    </CardHeader>
                    
                    <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {product.description || "No description available for this technical component."}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-2xl font-bold tracking-tight">${product.price.toFixed(2)}</span>
                        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                          <span className="text-xs font-semibold text-amber-600 animate-pulse">
                            Only {product.stockQuantity} left!
                          </span>
                        )}
                      </div>
                    </CardContent>

                    {/* Footer / Add to Cart */}
                    <CardFooter className="p-5 pt-0">
                      <AddToCartButton product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        stockQuantity: product.stockQuantity,
                        imageId: product.images && product.images.length > 0 ? product.images[0].id : undefined
                      }} />
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination totalPages={data.totalPages} currentPage={data.number} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
