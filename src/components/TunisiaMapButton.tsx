import tunisiaMap from "@/assets/tunisia-map.png";

const TunisiaMapButton = () => {
  return (
    <div className="w-full max-w-sm sm:max-w-md my-8 sm:my-12 flex justify-center">
      <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-4 border-primary shadow-xl">
          <img 
            src={tunisiaMap} 
            alt="Carte de la Tunisie" 
            className="w-32 h-40 sm:w-40 sm:h-48 object-contain mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default TunisiaMapButton;
