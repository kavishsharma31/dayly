import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-secondary via-secondary/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
        <p className="text-primary-dark mb-6">Your daily progress companion</p>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 max-w-4xl mx-auto leading-tight mb-8">
          Transform your big goals into{" "}
          <span className="text-primary">achievable daily tasks</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          DayLy helps you break down your ambitious goals into manageable 30-minute daily tasks,
          making consistent progress simple and achievable.
        </p>
        
        <div className="flex justify-center">
          <Button size="lg" className="text-base">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};