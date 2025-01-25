import { Check } from "lucide-react";

export const Benefits = () => {
  const benefits = [
    "Never feel overwhelmed by your goals again",
    "Build consistent daily habits",
    "Track your progress effortlessly",
    "Achieve more in less time",
  ];

  return (
    <section className="py-20 px-4 bg-secondary">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Why Choose DayLy?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="bg-primary rounded-full p-1">
                <Check className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg text-gray-800">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};