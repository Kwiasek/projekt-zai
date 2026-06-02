"use client";

import { useCartStore } from "@/lib/cartStore";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageId?: number;
    stockQuantity: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  return (
    <Button 
      className="w-full" 
      disabled={product.stockQuantity <= 0}
      onClick={() => addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageId: product.imageId
      })}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  );
}
