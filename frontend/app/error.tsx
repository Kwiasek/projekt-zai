"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 p-6 rounded-full mb-6 text-destructive">
        <AlertTriangle className="h-12 w-12" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-2">Something went wrong!</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
        We apologize for the inconvenience. An unexpected error has occurred in the application.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="default" 
          size="lg" 
          className="rounded-full px-8"
          onClick={() => reset()}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        
        <Link href="/">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full px-8"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Back Home
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-muted rounded-lg text-left overflow-auto max-w-2xl w-full">
          <p className="font-mono text-sm whitespace-pre-wrap">{error.stack}</p>
        </div>
      )}
    </div>
  );
}
