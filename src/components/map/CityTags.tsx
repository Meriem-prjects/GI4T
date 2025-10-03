import { useEffect, useRef } from 'react';
import { City } from '@/types/map';
import { Button } from '@/components/ui/button';

interface CityTagsProps {
  cities: City[];
  selectedCity: City | null;
  onTagClick: (city: City) => void;
  onTagDoubleClick: (city: City) => void;
}

export const CityTags = ({ cities, selectedCity, onTagClick, onTagDoubleClick }: CityTagsProps) => {
  const tagRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (selectedCity) {
      const tagElement = tagRefs.current.get(selectedCity.id);
      if (tagElement) {
        setTimeout(() => {
          tagElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }, 100);
      }
    }
  }, [selectedCity]);

  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-2">
      <div className="flex gap-2 min-w-max px-1">
        {cities.map((city) => {
          const isSelected = selectedCity?.id === city.id;
          return (
            <Button
              key={city.id}
              ref={(el) => {
                if (el) tagRefs.current.set(city.id, el);
              }}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onTagClick(city)}
              onDoubleClick={() => onTagDoubleClick(city)}
              className={`
                whitespace-nowrap transition-all duration-300
                ${isSelected 
                  ? 'bg-[#AEC3F2] text-[#1653BE] font-bold scale-105 hover:bg-[#9BB5E8]' 
                  : 'border-[#347EFF] bg-white text-[#347EFF] hover:bg-[#EEF2FD]'
                }
              `}
            >
              {city.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
