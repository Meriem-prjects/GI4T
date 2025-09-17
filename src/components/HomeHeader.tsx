import { Button } from "@/components/ui/button";

const HomeHeader = () => {
  return (
    <header className="bg-white h-16 sm:h-20 flex items-center justify-center relative border-b border-border shadow-sm">
      <div className="text-center">
        {/* Actual JustClic Logo */}
        <div className="flex items-center justify-center mb-1">
          <img 
            src="/Feelinx_upload/justclic-logo.png" 
            alt="JustClic.tn" 
            className="h-8 sm:h-12 w-auto object-contain"
          />
        </div>
        <p className="text-primary text-xs font-medium hidden sm:block">Information citoyenne simplifiée</p>
      </div>
      
      {/* Language Switcher */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex items-center">
        <div className="flex items-center bg-muted rounded-full p-1">
          <Button size="sm" className="bg-primary text-primary-foreground rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium">
            FR
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full px-2 sm:px-4 py-1 text-xs sm:text-sm">
            AR
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;