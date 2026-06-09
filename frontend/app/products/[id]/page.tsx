import { fetchApi, API_BASE_URL } from "@/lib/fetchApi";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { 
  Cpu, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: Product | null = null;

  try {
    product = await fetchApi(`/api/product/${id}`, { cache: "no-store" });
  } catch (e) {
    console.error("Failed to fetch product", e);
    return notFound();
  }

  if (!product) {
    return notFound();
  }

  const mainImageId = product.images && product.images.length > 0 
    ? product.images.sort((a, b) => a.displayOrder - b.displayOrder)[0].id 
    : null;

  const hasAttributes = product.attributes && Object.keys(product.attributes).length > 0;

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Breadcrumbs / Back button */}
      <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted/30 rounded-3xl overflow-hidden border border-muted-foreground/10">
            {mainImageId ? (
              <Image
                src={`${API_BASE_URL}/api/image/${mainImageId}`}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Cpu className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
            {product.stockQuantity <= 0 && (
              <Badge variant="destructive" className="absolute top-6 right-6 px-4 py-1 text-sm rounded-full">
                Out of Stock
              </Badge>
            )}
          </div>
          
          {/* Thumbnails if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.sort((a, b) => a.displayOrder - b.displayOrder).map((img) => (
                <div key={img.id} className="relative aspect-square bg-muted/20 rounded-xl border border-muted-foreground/5 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors">
                  <Image
                    src={`${API_BASE_URL}/api/image/${img.id}`}
                    alt={`${product.name} thumbnail`}
                    fill
                    className="object-cover p-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          <div className="mb-2">
            {product.category && (
              <Badge variant="secondary" className="mb-4">
                {product.category.name}
              </Badge>
            )}
            <h1 className="text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">${product.price.toFixed(2)}</p>
          </div>

          <Card className="border-muted-foreground/10 bg-muted/5 mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Availability</span>
                  <span className={product.stockQuantity > 0 ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} units in stock` : "Out of stock"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium">Brand New</span>
                </div>
                <Separator className="my-4" />
                <AddToCartButton product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  stockQuantity: product.stockQuantity,
                  imageId: mainImageId || undefined
                }} />
                <p className="text-xs text-center text-muted-foreground">
                  Free shipping on orders over $500. Secure checkout guaranteed.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Product Description
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description || "No description available for this technical component."}
              </p>
            </div>

            {hasAttributes && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  Technical Specifications
                </h3>
                <div className="rounded-2xl border border-muted-foreground/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-muted-foreground/10">
                      {Object.entries(product.attributes!).map(([key, value]) => (
                        <tr key={key} className="bg-muted/5 hover:bg-muted/10 transition-colors">
                          <td className="py-3 px-4 font-medium text-muted-foreground w-1/3 border-r border-muted-foreground/10">{key}</td>
                          <td className="py-3 px-4 text-foreground">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-muted-foreground/10">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="h-6 w-6 text-primary/70" />
                <span className="text-xs font-bold uppercase tracking-wider">Fast Delivery</span>
                <span className="text-[10px] text-muted-foreground">Ships in 24-48h</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary/70" />
                <span className="text-xs font-bold uppercase tracking-wider">2 Year Warranty</span>
                <span className="text-[10px] text-muted-foreground">Full coverage</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="h-6 w-6 text-primary/70" />
                <span className="text-xs font-bold uppercase tracking-wider">30 Day Return</span>
                <span className="text-[10px] text-muted-foreground">No questions asked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Card component if not already imported or available globally
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-3xl border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}
