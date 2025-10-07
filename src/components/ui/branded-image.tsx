import { cn } from "@/lib/utils";

interface BrandedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  showFavicon?: boolean;
  faviconSize?: "sm" | "md" | "lg";
}

const BrandedImage = ({ 
  src, 
  alt, 
  className,
  showFavicon = true,
  faviconSize = "md",
  ...props 
}: BrandedImageProps) => {
  const faviconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className="relative inline-block w-fit">
      <img 
        src={src} 
        alt={alt} 
        className={cn(className)}
        {...props}
      />
      {showFavicon && (
        <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-lg">
          <img 
            src="/favicon.png" 
            alt="JustClic.tn" 
            className={cn(faviconSizes[faviconSize], "object-contain")}
          />
        </div>
      )}
    </div>
  );
};

export { BrandedImage };
