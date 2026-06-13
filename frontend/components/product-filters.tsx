"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowUpDown, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("name") || "";
  const currentCategory = searchParams.get("categoryId") || "";
  const currentSort = searchParams.get("sort") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sync search input with URL search param changes (e.g. from navbar search)
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  // Debounced input change handler
  useEffect(() => {
    if (searchTerm === currentSearch) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm.trim()) {
          params.set("name", searchTerm);
        } else {
          params.delete("name");
        }
        params.delete("page"); // Reset page to 0 on filter change
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch, pathname, router, searchParams]);

  const handleCategorySelect = (categoryId: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId) {
        params.set("categoryId", categoryId);
      } else {
        params.delete("categoryId");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    });
    setIsOpen(false); // Close mobile drawer if open
  };

  const handleSortChange = (sortValue: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (sortValue) {
        params.set("sort", sortValue);
      } else {
        params.delete("sort");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(pathname);
    });
    setIsOpen(false);
  };

  const hasActiveFilters = currentSearch || currentCategory || currentSort;

  const sortingOptions = [
    { value: "", label: "Default" },
    { value: "price,asc", label: "Price: Low to High" },
    { value: "price,desc", label: "Price: High to Low" },
    { value: "name,asc", label: "Name: A to Z" },
    { value: "name,desc", label: "Name: Z to A" },
  ];

  const filterContent = (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full bg-muted/30 border-muted-foreground/20 rounded-xl"
          />
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <Tag className="h-4 w-4" />
          Categories
        </h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-left ${
              !currentCategory
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id.toString())}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-left ${
                currentCategory === category.id.toString()
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4" />
          Sort By
        </h3>
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full h-10 px-3 py-2 text-sm bg-muted/30 border border-muted-foreground/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
        >
          {sortingOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-background">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          className="w-full rounded-xl gap-2 mt-4 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-300"
        >
          <X className="h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-64 shrink-0 bg-card p-6 rounded-3xl border border-muted-foreground/10 shadow-xs h-fit sticky top-24">
        {filterContent}
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden w-full flex gap-3 mb-6">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="flex-1 rounded-2xl gap-2 h-11 border-muted-foreground/20"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters & Sorting
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full leading-none">
              {(currentSearch ? 1 : 0) + (currentCategory ? 1 : 0) + (currentSort ? 1 : 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="rounded-2xl h-11 px-3 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile Drawer Slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer panel */}
          <div className="relative flex w-full max-w-xs flex-col bg-background p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Filters
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
