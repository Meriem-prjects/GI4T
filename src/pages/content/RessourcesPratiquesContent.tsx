import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import AdminManagedSection from "@/components/accesdroits/AdminManagedSection";

const RessourcesPratiquesContent = () => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('practicalResourcesTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className={`text-center mb-6 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('practicalResourcesTitle')}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('practicalResourcesDesc')}
          </p>
        </div>

        {/* Downloadable documents published from the back-office */}
        <AdminManagedSection
          kind="practical_resources"
          title={{ fr: "Documents à télécharger", ar: "وثائق للتحميل" }}
          emptyMessage={{
            fr: "Aucune ressource publiée pour le moment.",
            ar: "لا توجد موارد منشورة حاليا.",
          }}
        />

        {/* Newsletter Signup */}
        <div className="bg-muted/50 rounded-lg p-6 text-center animate-fade-in">
          <h3 className="text-xl font-semibold mb-2">{t('stayInformed')}</h3>
          <p className="text-muted-foreground mb-4">
            {isRTL ? 'اشترك ليصلك جديد الموارد' : 'Recevez les nouvelles ressources par courriel.'}
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input placeholder={`${t('yourEmail')}...`} className="flex-1" />
            <Button>
              {t('subscribe')}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RessourcesPratiquesContent;
