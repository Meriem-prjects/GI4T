import { useState, useEffect } from 'react';

const TYPING_SPEED = 80;
const PAUSE_DURATION = 2000;
const DELETE_SPEED = 50;

const placeholdersFr = [
  "Droit à la liberté d'expression",
  "Tribunal administratif",
  "Liberté de circulation",
  "Cour d'appel",
  "Droits de l'homme",
  "Justice constitutionnelle",
];

const placeholdersAr = [
  "الحق في حرية التعبير",
  "المحكمة الإدارية",
  "حرية التنقل",
  "محكمة الاستئناف",
  "حقوق الإنسان",
  "العدالة الدستورية",
];

export const useTypingPlaceholder = (language: 'fr' | 'ar' = 'fr') => {
  const [placeholder, setPlaceholder] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const placeholders = language === 'ar' ? placeholdersAr : placeholdersFr;

  useEffect(() => {
    const currentText = placeholders[currentIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && placeholder === currentText) {
      // Pause before starting to delete
      timeout = setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
    } else if (isDeleting && placeholder === '') {
      // Move to next placeholder
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % placeholders.length);
    } else if (isDeleting) {
      // Delete character
      timeout = setTimeout(() => {
        setPlaceholder(currentText.substring(0, placeholder.length - 1));
      }, DELETE_SPEED);
    } else {
      // Type character
      timeout = setTimeout(() => {
        setPlaceholder(currentText.substring(0, placeholder.length + 1));
      }, TYPING_SPEED);
    }

    return () => clearTimeout(timeout);
  }, [placeholder, currentIndex, isDeleting, placeholders]);

  return placeholder;
};
