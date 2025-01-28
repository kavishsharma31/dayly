import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { VideoDemo } from "@/components/landing/VideoDemo";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <VideoDemo />
      <HowItWorks />
      <Benefits />
      <Footer />
    </div>
  );
};

export default Index;