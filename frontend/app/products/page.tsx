import { fetchApi, API_BASE_URL } from "@/lib/fetchApi";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import Image from "next/image"

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

  let endpoint = `/api/products?page=${page}&size=12`;
  if (name) endpoint += `&name=${encodeURIComponent(name)}`;
  if (categoryId) endpoint += `&categoryId=${categoryId}`;

  let data: PaginatedResponse | null = null;
  let error: string | null = null;

  try {
    data = await fetchApi(endpoint, { cache: "no-store" });
  } catch (e) {
    if (e instanceof Error) error = e.message;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Computer Parts</h1>
          <p className="text-muted-foreground mt-1">Browse our high-performance hardware catalog.</p>
        </div>
        {/* Filters would go here */}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
          Error loading products: {error}
        </div>
      )}

      {!data || data.content.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
          <Cpu className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
          <p className="text-xl font-medium text-muted-foreground">No products found.</p>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.content.map((product) => (
            <Card key={product.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow border-muted-foreground/10">
              <Link href={`/products/${product.id}`} className="block relative aspect-square bg-muted/50">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={`${API_BASE_URL}/api/image/${product.images[0].id}`}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Cpu className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                {product.stockQuantity <= 0 && (
                  <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
                )}
                {product.category && (
                  <Badge variant="secondary" className="absolute top-2 left-2 opacity-90">
                    {product.category.name}
                  </Badge>
                )}
              </Link>
              <CardHeader className="p-4 pb-2">
                <Link href={`/products/${product.id}`}>
                  <CardTitle className="text-lg line-clamp-1 hover:text-primary transition-colors">
                    {product.name}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {product.description}
                </p>
                <div className="mt-auto">
                  <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
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
      )}
    </div>
  );
}
