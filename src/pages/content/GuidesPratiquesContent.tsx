import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, Download, BookOpen, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const GuidesPratiquesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const guides = [
    {
      id: 1,
      title: "Guide du demandeur d'emploi",
      description: "Tout savoir sur vos droits en tant que demandeur d'emploi : inscription, allocation, accompagnement.",
      category: "Emploi",
      duration: "15 min",
      difficulty: "Débutant",
      downloads: 1250,
      tags: ["Pôle emploi", "Allocation", "Formation"]
    },
    {
      id: 2,
      title: "Comprendre ses droits au logement",
      description: "Les différentes aides au logement, les recours en cas de problème avec le propriétaire.",
      category: "Logement", 
      duration: "20 min",
      difficulty: "Intermédiaire",
      downloads: 980,
      tags: ["APL", "Bailleur", "Expulsion"]
    },
    {
      id: 3,
      title: "Accès aux soins de santé",
      description: "Navigation dans le système de santé français, CMU, ACS et accès aux spécialistes.",
      category: "Santé",
      duration: "12 min", 
      difficulty: "Débutant",
      downloads: 1450,
      tags: ["CMU", "Sécurité sociale", "Médecin"]
    },
    {
      id: 4,
      title: "Droits de la famille et enfance",
      description: "Allocations familiales, garde d'enfants, scolarité et protection de l'enfance.",
      category: "Famille",
      duration: "18 min",
      difficulty: "Intermédiaire", 
      downloads: 720,
      tags: ["CAF", "École", "Garde"]
    },
    {
      id: 5,
      title: "Aide juridictionnelle",
      description: "Comment bénéficier de l'aide juridictionnelle, les conditions et la procédure.",
      category: "Justice",
      duration: "10 min",
      difficulty: "Débutant",
      downloads: 650,
      tags: ["Avocat", "Tribunal", "Gratuit"]
    },
    {
      id: 6,
      title: "Étrangers en France",
      description: "Titre de séjour, naturalisation, regroupement familial et droits sociaux.",
      category: "Immigration",
      duration: "25 min",
      difficulty: "Avancé",
      downloads: 890,
      tags: ["Préfecture", "Visa", "Naturalisation"]
    }
  ];

  const categories = ["Tous", "Emploi", "Logement", "Santé", "Famille", "Justice", "Immigration"];

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Tous" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className={`flex-1 ${isRTL ? 'font-almarai' : ''}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('practicalGuidesTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('practicalGuidesTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('practicalGuidesDesc')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-fade-in">
          <div className="relative mb-4">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t('searchDot')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-fade-in">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="hover:shadow-lg transition-shadow duration-300 hover-scale">
              <CardHeader>
                <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="secondary" className="text-xs">
                    {guide.category}
                  </Badge>
                  <div className={`flex items-center text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Download className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {guide.downloads}
                  </div>
                </div>
                <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>{guide.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm text-muted-foreground mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {guide.description}
                </p>
                
                <div className={`flex items-center justify-between mb-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Clock className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {guide.duration}
                  </div>
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Users className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {guide.difficulty}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {guide.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <BookOpen className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t('read')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`bg-muted/50 rounded-lg p-6 text-center animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h3 className="text-xl font-semibold mb-2">{t('needHelp')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('needHelpDesc')}
          </p>
          <Button>
            {t('contactUs')}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default GuidesPratiquesContent;