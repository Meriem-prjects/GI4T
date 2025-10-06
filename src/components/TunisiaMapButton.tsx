import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const TunisiaMapButton = () => {
  return (
    <Link to="/acces-aux-droits/carte-interactive" className="block w-full">
      <div className="relative w-full max-w-md mx-auto group cursor-pointer transition-transform duration-300 hover:scale-105">
        {/* Tunisia Map SVG */}
        <svg
          viewBox="0 0 200 300"
          className="w-full h-auto drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified Tunisia shape with blue border */}
          <path
            d="M 100 20 
               L 120 25 L 135 35 L 145 50 L 150 70 
               L 155 90 L 158 110 L 160 130 
               L 158 150 L 155 170 L 150 190 
               L 145 210 L 138 230 L 130 250 
               L 120 270 L 110 285 L 100 295 
               L 90 285 L 80 270 L 70 250 
               L 62 230 L 55 210 L 50 190 
               L 45 170 L 42 150 L 40 130 
               L 42 110 L 45 90 L 50 70 
               L 55 50 L 65 35 L 80 25 Z"
            fill="hsl(var(--accent) / 0.3)"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            className="transition-all duration-300 group-hover:fill-[hsl(var(--accent)/0.5)] group-hover:drop-shadow-2xl"
          />
          
          {/* Decorative inner glow */}
          <path
            d="M 100 20 
               L 120 25 L 135 35 L 145 50 L 150 70 
               L 155 90 L 158 110 L 160 130 
               L 158 150 L 155 170 L 150 190 
               L 145 210 L 138 230 L 130 250 
               L 120 270 L 110 285 L 100 295 
               L 90 285 L 80 270 L 70 250 
               L 62 230 L 55 210 L 50 190 
               L 45 170 L 42 150 L 40 130 
               L 42 110 L 45 90 L 50 70 
               L 55 50 L 65 35 L 80 25 Z"
            fill="none"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="1"
            className="opacity-50"
          />
        </svg>

        {/* Animated Pins */}
        <div className="absolute top-[15%] left-[52%] -translate-x-1/2 -translate-y-1/2">
          <MapPin 
            className="w-6 h-6 sm:w-7 sm:h-7 text-primary drop-shadow-lg animate-pulse" 
            fill="hsl(var(--primary))"
          />
        </div>

        <div className="absolute top-[40%] left-[48%] -translate-x-1/2 -translate-y-1/2">
          <MapPin 
            className="w-5 h-5 sm:w-6 sm:h-6 text-primary drop-shadow-lg animate-pulse" 
            fill="hsl(var(--primary))"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        <div className="absolute top-[65%] left-[50%] -translate-x-1/2 -translate-y-1/2">
          <MapPin 
            className="w-5 h-5 sm:w-6 sm:h-6 text-primary drop-shadow-lg animate-pulse" 
            fill="hsl(var(--primary))"
            style={{ animationDelay: "0.6s" }}
          />
        </div>

        {/* Label */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-primary/20">
          <span className="font-semibold text-sm sm:text-base text-primary whitespace-nowrap">
            Carte Interactive
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TunisiaMapButton;
