import { MapPin } from "lucide-react";

const TunisiaMapButton = () => {
  return (
    <div className="relative w-full max-w-[280px] mx-auto group cursor-pointer transition-transform duration-300 hover:scale-105">
      {/* Tunisia Map SVG */}
      <svg
        viewBox="0 0 200 300"
        className="w-full h-auto drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tunisia outline with blue border */}
        <path
          d="M 100 20 
             L 110 25 L 120 35 L 125 50 
             L 130 70 L 132 90 L 130 110
             L 125 130 L 120 150 L 118 170
             L 115 190 L 112 210 L 108 230
             L 105 250 L 102 270 L 100 285
             L 98 270 L 95 250 L 92 230
             L 88 210 L 85 190 L 82 170
             L 80 150 L 75 130 L 70 110
             L 68 90 L 70 70 L 75 50
             L 80 35 L 90 25 Z"
          fill="hsl(var(--accent) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          className="transition-all duration-300 group-hover:fill-[hsl(var(--accent)/0.25)]"
        />
        
        {/* Animated pins */}
        <g className="animate-pulse">
          <circle cx="100" cy="80" r="4" fill="hsl(var(--destructive))" />
          <path
            d="M 100 70 L 100 80"
            stroke="hsl(var(--destructive))"
            strokeWidth="2"
            fill="none"
          />
        </g>
        
        <g className="animate-pulse" style={{ animationDelay: "0.3s" }}>
          <circle cx="95" cy="150" r="4" fill="hsl(var(--destructive))" />
          <path
            d="M 95 140 L 95 150"
            stroke="hsl(var(--destructive))"
            strokeWidth="2"
            fill="none"
          />
        </g>
        
        <g className="animate-pulse" style={{ animationDelay: "0.6s" }}>
          <circle cx="108" cy="200" r="4" fill="hsl(var(--destructive))" />
          <path
            d="M 108 190 L 108 200"
            stroke="hsl(var(--destructive))"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </svg>
      
      {/* Label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <p className="text-sm font-semibold text-primary text-center">
          Carte Interactive
        </p>
      </div>
    </div>
  );
};

export default TunisiaMapButton;
