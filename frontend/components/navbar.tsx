"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, LogOut, Cpu } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/lib/cartStore";
import { fetchApi } from "@/lib/fetchApi";
import { useAuthStore } from "./auth-store-provider"

export default function Navbar() {
  const { getTotalItems } = useCartStore();
  const { user, clearAuth } = useAuthStore(
      (state) => state
    );
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const cartCount = getTotalItems();
  const isLoggedIn = !!user;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?name=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchApi("/api/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      clearAuth();
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Cpu className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block tracking-tight">TechStore</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-6 mr-6">
          <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">All Products</Link>
          <Link href="/products?categoryId=1" className="text-sm font-medium transition-colors hover:text-primary">Processors</Link>
          <Link href="/products?categoryId=2" className="text-sm font-medium transition-colors hover:text-primary">Graphics</Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center px-2 lg:px-6">
          <form onSubmit={handleSearch} className="w-full max-w-sm flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-9 bg-muted/50 rounded-full border-muted-foreground/20 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Section: Cart & User */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Shopping Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Profile / Login */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Logged in as {user?.role.replace('ROLE_', '').toLowerCase()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">My Orders</Link>
                </DropdownMenuItem>
                {user?.role === "ROLE_ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer font-semibold text-primary">
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="ml-2">
              <Button variant="default" size="sm" className="hidden sm:flex rounded-full px-4">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
