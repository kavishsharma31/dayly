import { Goal, Calendar, Clock } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: <Goal className="w-12 h-12 text-primary" />,
      title: "Set Your Goal",
      description: "Define what you want to achieve, big or small.",
    },
    {
      icon: <Calendar className="w-12 h-12 text-primary" />,
      title: "Daily Breakdown",
      description: "We'll create a series of daily tasks to help you progress.",
    },
    {
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: "30-Min Tasks",
      description: "Each task takes 30 minutes or less to complete.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How DayLy Works
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg hover:bg-secondary transition-colors duration-200"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};