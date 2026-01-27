import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <SEO
        title="404 - Page Not Found"
        description="The page you are looking for doesn't exist. Find your favorite spirits on our products page."
      />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="section-container relative z-10 text-center">
        <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
          <Search className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-8xl font-black text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">The hunt went cold...</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
          We couldn't find the bottle or page you were looking for. It might have been moved or never existed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button className="btn-gradient-primary h-12 px-8 rounded-xl">
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-2">
              Browse Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
