const HomeFooter = () => {
  return (
    <footer className="bg-white border-t border-border py-3 sm:py-6 shadow-sm">
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
          <a href="#" className="text-xs sm:text-sm font-medium text-primary">
            Accueil
          </a>
          <a href="#" className="text-xs sm:text-sm text-primary">
            Décisions
          </a>
          <a href="#" className="text-xs sm:text-sm text-primary">
            Droits
          </a>
          <a href="#" className="text-xs sm:text-sm text-primary">
            À propos
          </a>
          <a href="#" className="text-xs sm:text-sm text-primary">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;