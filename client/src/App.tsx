import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Generate from "@/pages/generate";
import Campaigns from "@/pages/campaigns";
import Analytics from "@/pages/analytics";
import { LayoutDashboard, Sparkles, History, BarChart3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/generate" component={Generate} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/generate", label: "Generate", icon: Sparkles },
    { path: "/campaigns", label: "Campaigns", icon: History },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">NovaMind</span>
            </div>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <span
                      className={cn(
                        "flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium transition-colors hover-elevate cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                      data-testid={`link-nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="novamind-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <main>
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
