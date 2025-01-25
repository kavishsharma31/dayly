import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">DayLy</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#explore" className="text-gray-700 hover:text-primary">Explore</a>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-primary">
                Product <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-primary">
                Resources <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
            <a href="#pricing" className="text-gray-700 hover:text-primary">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700">
              Login
            </Button>
            <Button className="bg-primary hover:bg-primary-dark text-white">
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};