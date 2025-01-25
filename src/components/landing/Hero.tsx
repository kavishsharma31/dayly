import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-secondary to-white">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 animate-float">
          Transform Your Goals into{" "}
          <span className="text-primary">Daily Progress</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
          DayLy breaks down your ambitious goals into manageable 30-minute daily
          tasks, making progress simple and consistent.
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg rounded-full transition-all duration-200 flex items-center gap-2 group"
        >
          Get Started
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};