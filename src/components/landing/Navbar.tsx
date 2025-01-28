import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // If session is null (user logged out or token expired)
      if (!session) {
        navigate("/"); // Changed to redirect to landing page instead of auth
        toast({
          title: "Session ended",
          description: "Please log in again to continue.",
          duration: 3000,
        });
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null); // Immediately clear session state
      navigate("/"); // Changed to redirect to landing page
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              DayLy
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
                <Button className="bg-primary hover:bg-primary-dark text-white" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-700" asChild>
                  <Link to="/auth?mode=login">Login</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary-dark text-white" asChild>
                  <Link to="/auth?mode=signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};