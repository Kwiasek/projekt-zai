import Link from "next/link";
import { 
  Cpu, 
  Gamepad2, 
  Database, 
  Layout, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Headphones,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const categories = [
    {
      id: 1,
      name: "Processors",
      description: "High-performance CPUs for work and play.",
      icon: <Cpu className="h-8 w-8" />,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      id: 2,
      name: "Graphics Cards",
      description: "Next-gen GPUs for ultimate visual fidelity.",
      icon: <Gamepad2 className="h-8 w-8" />,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      id: 3,
      name: "Motherboards",
      description: "The foundation of your dream PC build.",
      icon: <Layout className="h-8 w-8" />,
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      id: 4,
      name: "Memory (RAM)",
      description: "Fast and reliable RAM for smooth multitasking.",
      icon: <Activity className="h-8 w-8" />,
      color: "bg-green-500/10 text-green-500",
    },
    {
      id: 5,
      name: "Storage",
      description: "High-speed SSDs and high-capacity HDDs.",
      icon: <Database className="h-8 w-8" />,
      color: "bg-red-500/10 text-red-500",
    },
    {
      id: 6,
      name: "Power Supplies",
      description: "Efficient and reliable power for your rig.",
      icon: <Zap className="h-8 w-8" />,
      color: "bg-yellow-500/10 text-yellow-500",
    },
  ];

  const features = [
    {
      title: "Fast Shipping",
      description: "Free delivery on all orders over $500.",
      icon: <Truck className="h-6 w-6" />,
    },
    {
      title: "Secure Checkout",
      description: "100% secure payment processing.",
      icon: <ShieldCheck className="h-6 w-6" />,
    },
    {
      title: "Expert Support",
      description: "24/7 technical support for your builds.",
      icon: <Headphones className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background with tech-inspired gradient/overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] z-0" />
        
        <div className="container relative z-10 px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-6 bg-background/50 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            New RTX 50-series GPUs now in stock
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 pb-2 px-1 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-tight">
            Build Your Ultimate Rig
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Premium components for enthusiasts, gamers, and professionals. 
            Engineered for performance, reliability, and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="rounded-full px-8 h-12 text-lg">
                Shop Components
              </Button>
            </Link>
            <Link href="/products?featured=true">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-lg">
                Build a PC
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground">Find exactly what you need for your next build.</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="group">
              View all products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?categoryId=${category.id}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-muted-foreground/10">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className={`p-3 rounded-2xl w-fit mb-6 ${category.color}`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    {category.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse Category
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Banner */}
      <section className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 rounded-4xl bg-muted/50 border">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                {feature.icon}
              </div>
              <h4 className="font-bold mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Activity(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
