import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Shield, Users, Gavel, Heart, Home, Briefcase, ChevronRight, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import AdminManagedSection from "@/components/accesdroits/AdminManagedSection";

const LiensUtilesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const categoryCards = [
    { id: "institutions", name: isRTL ? "المؤسسات الرسمية" : "Institutions officielles", icon: Shield, color: "bg-blue-600", bgColor: "bg-blue-50", count: 3 },
    { id: "droits", name: isRTL ? "حقوق الإنسان والحريات" : "Droits humains", icon: Users, color: "bg-rose-600", bgColor: "bg-rose-50", count: 3 },
    { id: "justice", name: isRTL ? "العدالة" : "Justice", icon: Gavel, color: "bg-amber-600", bgColor: "bg-amber-50", count: 3 },
    { id: "social", name: isRTL ? "الشؤون الاجتماعية" : "Aide sociale", icon: Heart, color: "bg-purple-600", bgColor: "bg-purple-50", count: 3 },
    { id: "logement", name: isRTL ? "السكن" : "Logement", icon: Home, color: "bg-emerald-600", bgColor: "bg-emerald-50", count: 3 },
    { id: "emploi", name: isRTL ? "التشغيل" : "Emploi", icon: Briefcase, color: "bg-cyan-600", bgColor: "bg-cyan-50", count: 3 }
  ];

  const linkCategories = [
    {
      id: "institutions",
      title: isRTL ? "المؤسسات الرسمية" : "Institutions officielles",
      icon: Shield,
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      links: [
        {
          name: "Présidence de la République Tunisienne",
          url: "http://www.carthage.tn",
          description: isRTL ? "الموقع الرسمي لرئاسة الجمهورية" : "Site officiel de la Présidence de la République",
          verified: true
        },
        {
          name: "Assemblée des Représentants du Peuple",
          url: "http://www.arp.tn",
          description: isRTL ? "البرلمان التونسي - القوانين والنقاشات" : "Parlement tunisien - Lois et débats",
          verified: true
        },
        {
          name: "Tribunal Administratif",
          url: "http://www.ta.tn",
          description: isRTL ? "الطعن في القرارات الإدارية" : "Recours contre les décisions administratives",
          verified: true
        }
      ]
    },
    {
      id: "droits",
      title: isRTL ? "حقوق الإنسان والحريات" : "Droits humains et libertés",
      icon: Users,
      color: "bg-rose-600",
      bgColor: "bg-rose-50",
      links: [
        {
          name: "Ligue Tunisienne des Droits de l'Homme",
          url: "http://www.ltdh.tn",
          description: isRTL ? "الدفاع عن حقوق الإنسان في تونس" : "Défense des droits humains en Tunisie",
          verified: true
        },
        {
          name: "Forum Tunisien des Droits Économiques et Sociaux",
          url: "http://www.ftdes.net",
          description: isRTL ? "الحقوق الاقتصادية والاجتماعية" : "Droits économiques et sociaux",
          verified: true
        },
        {
          name: "Amnesty International Tunisie",
          url: "https://www.amnesty.org/fr/countries/middle-east-and-north-africa/tunisia/",
          description: isRTL ? "منظمة دولية لحقوق الإنسان" : "Organisation internationale des droits humains",
          verified: false
        }
      ]
    },
    {
      id: "justice",
      title: isRTL ? "العدالة والمساعدة القانونية" : "Justice et aide juridique",
      icon: Gavel,
      color: "bg-amber-600",
      bgColor: "bg-amber-50",
      links: [
        {
          name: "Ordre des Avocats de Tunis",
          url: "http://www.barreau.org.tn",
          description: isRTL ? "مجلس الهيئة ودليل المحامين" : "Conseil de l'ordre et annuaire des avocats",
          verified: true
        },
        {
          name: "Ministère de la Justice",
          url: "http://www.e-justice.tn",
          description: isRTL ? "خدمات العدالة الإلكترونية" : "Services de justice électronique",
          verified: true
        },
        {
          name: "Centre d'Information Juridique",
          url: "http://www.legislation.tn",
          description: isRTL ? "الوصول إلى النصوص القانونية التونسية" : "Accès aux textes de loi tunisiens",
          verified: true
        }
      ]
    },
    {
      id: "social",
      title: isRTL ? "الشؤون الاجتماعية والصحة" : "Aide sociale et santé",
      icon: Heart,
      color: "bg-purple-600",
      bgColor: "bg-purple-50",
      links: [
        {
          name: "Ministère des Affaires Sociales",
          url: "http://www.social.gov.tn",
          description: isRTL ? "برامج المساعدات الاجتماعية والحماية" : "Programmes d'aide sociale et de protection",
          verified: true
        },
        {
          name: "Caisse Nationale d'Assurance Maladie",
          url: "http://www.cnam.nat.tn",
          description: isRTL ? "التغطية الصحية والاسترجاع" : "Couverture maladie et remboursements",
          verified: true
        },
        {
          name: "Croissant-Rouge Tunisien",
          url: "http://www.croissantrouge.tn",
          description: isRTL ? "مساعدة إنسانية واجتماعية" : "Aide humanitaire et assistance sociale",
          verified: false
        }
      ]
    },
    {
      id: "logement",
      title: isRTL ? "السكن والتعمير" : "Logement et urbanisme",
      icon: Home,
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      links: [
        {
          name: "Ministère de l'Équipement et de l'Habitat",
          url: "http://www.equipement.tn",
          description: isRTL ? "سياسات السكن والتهيئة" : "Politiques de logement et d'aménagement",
          verified: true
        },
        {
          name: "Société Nationale Immobilière de Tunisie",
          url: "http://www.snit.tn",
          description: isRTL ? "السكن الاجتماعي والبرامج العقارية" : "Logements sociaux et programmes immobiliers",
          verified: true
        },
        {
          name: "Agence Foncière d'Habitation",
          url: "http://www.afh.tn",
          description: isRTL ? "ترقية السكن الاجتماعي" : "Promotion du logement social",
          verified: false
        }
      ]
    },
    {
      id: "emploi",
      title: isRTL ? "التشغيل والتكوين" : "Emploi et formation",
      icon: Briefcase,
      color: "bg-cyan-600",
      bgColor: "bg-cyan-50",
      links: [
        {
          name: "Agence Nationale pour l'Emploi et le Travail Indépendant",
          url: "http://www.aneti.com.tn",
          description: isRTL ? "البحث عن عمل والتكوين المهني" : "Recherche d'emploi et formation professionnelle",
          verified: true
        },
        {
          name: "Union Générale Tunisienne du Travail",
          url: "http://www.ugtt.org.tn",
          description: isRTL ? "نقابة العمال - الدفاع عن الحقوق" : "Syndicat des travailleurs - Défense des droits",
          verified: true
        },
        {
          name: "Ministère de la Formation Professionnelle et de l'Emploi",
          url: "http://www.emploi.gov.tn",
          description: isRTL ? "سياسات التشغيل والتكوين" : "Politiques d'emploi et de formation",
          verified: true
        }
      ]
    }
  ];

  const filteredCategories = linkCategories
    .filter(category => !selectedCategory || category.id === selectedCategory)
    .map(category => ({
      ...category,
      links: category.links.filter(link => 
        link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.links.length > 0);

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
            <span className="text-foreground">{t('usefulLinksTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('usefulLinksTitle')}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('usefulLinksDesc')}
          </p>
        </div>

        {/* Admin-managed links — appear when the back-office has published entries */}
        <AdminManagedSection
          kind="useful_links"
          title={{ fr: "Liens récents", ar: "روابط حديثة" }}
        />

        {/* Search */}
        <div className="mb-6 animate-fade-in">
          <div className="relative max-w-md mx-auto">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t('searchDot')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>
        </div>

        {/* Category Cards */}
        <div className="mb-8 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryCards.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <Card 
                  key={cat.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${isSelected ? 'ring-2 ring-primary shadow-md' : ''} ${cat.bgColor}`}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className={`w-10 h-10 ${cat.color} rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium line-clamp-1">{cat.name}</span>
                    <Badge variant="secondary" className="mt-1 text-xs">{cat.count}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Links Categories */}
        <div className="space-y-8 mb-10 animate-fade-in">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id}>
                <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.links.map((link, linkIndex) => (
                    <Card 
                      key={linkIndex} 
                      className={`hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${category.bgColor}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base leading-tight pr-2">{link.name}</CardTitle>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {link.verified && (
                              <Badge className="text-xs bg-green-600 text-white">
                                {t('verified')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm mb-4">
                          {link.description}
                        </CardDescription>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block w-full"
                        >
                          <Button className={`w-full ${category.color} text-white hover:opacity-90`} size="sm">
                            <Globe className="h-3 w-3 mr-2" />
                            {isRTL ? 'زيارة الموقع' : 'Visiter le site'}
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggest Link Section */}
        <div className="bg-muted/50 rounded-lg p-6 text-center animate-fade-in">
          <h3 className="text-xl font-semibold mb-2">{t('suggestLink')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('suggestLinkDesc')}
          </p>
          <Button>
            {t('suggestLink')}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default LiensUtilesContent;
