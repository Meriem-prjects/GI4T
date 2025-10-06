import tunisiaMap from "@/assets/tunisia-map.png";

const TunisiaMapButton = () => {
  return (
    <div className="w-full max-w-[200px] sm:max-w-[240px] my-4 sm:my-6 flex justify-center">
      <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border-4 border-primary shadow-xl">
          <img 
            src={tunisiaMap} 
            alt="Carte de la Tunisie" 
            className="w-36 h-44 sm:w-44 sm:h-52 object-contain mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default TunisiaMapButton;
