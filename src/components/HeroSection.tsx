
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <div className="relative bg-gradient-hero py-20 px-4 text-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Join the Hottest Creators Now
        </h1>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Experience premium adult entertainment with interactive features, live streaming, and exclusive content from top creators worldwide.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 px-8 py-3 rounded-full font-semibold">
            Start Exploring
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-full">
            Learn More
          </Button>
        </div>
        
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">847k+</div>
            <div className="text-white/80">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">25k+</div>
            <div className="text-white/80">Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">$2.4M+</div>
            <div className="text-white/80">Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};
