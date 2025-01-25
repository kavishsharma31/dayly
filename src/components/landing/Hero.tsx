import { Search } from "lucide-react";

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
        
        <div className="max-w-2xl mx-auto relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search templates (e.g. Fitness, Learning)"
              className="w-full px-12 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {["Templates", "Daily Tasks", "Progress Tracking", "Goal Setting"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};