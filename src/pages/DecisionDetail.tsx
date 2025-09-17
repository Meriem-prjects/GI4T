import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, Download, Bookmark, Share2, Calendar, Building, Scale, ChevronLeft, ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ScanImageViewer } from "@/components/ScanImageViewer";
import type { Decision } from "@/types/decision";
import scanImage1 from "@/assets/decision-scan-1.jpg";
import scanImage2 from "@/assets/decision-scan-2.jpg";

const DecisionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample detailed decision data
  useEffect(() => {
    // Simulate API call
    const sampleDecision: Decision = {
      id: parseInt(id || "1"),
      number: "2024/147",
      title: "Protection des données personnelles dans le cadre des algorithmes de recommandation",
      court: "Conseil d'État",
      date: "15 mars 2024",
      description: "Cette décision précise les obligations des plateformes numériques en matière de transparence algorithmique et de protection des données personnelles des utilisateurs.",
      tags: ["Protection des données", "RGPD", "Algorithmes", "Transparence"],
      importance: "Majeure",
      importanceColor: "bg-red-100 text-red-800",
      caseNumber: "CE-2024-156789",
      jurisdiction: "Contentieux administratif",
      judges: ["Marie Dubois", "Jean Martin", "Sophie Laurent"],
      parties: {
        plaintiff: "Association de défense des droits numériques",
        defendant: "Plateforme sociale XYZ"
      },
      summary: "La Cour précise que les algorithmes de recommandation utilisés par les plateformes numériques doivent respecter les principes de transparence et de minimisation des données. Elle établit que les utilisateurs ont le droit d'obtenir des explications compréhensibles sur le fonctionnement des algorithmes qui les concernent.",
      legalPrinciples: [
        "Droit à l'explication des décisions algorithmiques",
        "Principe de minimisation des données (article 5 RGPD)",
        "Transparence des traitements de données personnelles",
        "Droit à l'information renforcé pour les algorithmes"
      ],
      scanImages: [scanImage1, scanImage2],
      fullText: `CONSEIL D'ÉTAT

Séance du 15 mars 2024
Lecture du 22 mars 2024

RÉPUBLIQUE FRANÇAISE
AU NOM DU PEUPLE FRANÇAIS

Le Conseil d'État,

Vu la requête enregistrée le 12 janvier 2024 au secrétariat du contentieux du Conseil d'État, présentée par l'Association de défense des droits numériques, tendant à ce que le Conseil d'État annule la décision implicite de rejet née du silence gardé par l'Autorité de régulation sur la demande de mise en demeure de la société Plateforme sociale XYZ ;

Vu le règlement général sur la protection des données (RGPD) ;
Vu le code des relations entre le public et l'administration ;
Vu le code de justice administrative ;

Après avoir entendu en séance publique :
- le rapport de Mme Marie Dubois, conseillère d'État,
- les conclusions de M. Jean Martin, rapporteur public ;

CONSIDÉRANT CE QUI SUIT :

1. Considérant que l'Association de défense des droits numériques demande l'annulation de la décision implicite de rejet née du silence gardé par l'Autorité de régulation sur sa demande de mise en demeure concernant les pratiques de la société Plateforme sociale XYZ en matière d'algorithmes de recommandation ;

2. Considérant que les algorithmes de recommandation utilisés par les plateformes numériques constituent des traitements de données personnelles au sens de l'article 4 du règlement général sur la protection des données ;

3. Considérant que le principe de transparence, énoncé à l'article 5 paragraphe 1 point a) du RGPD, impose aux responsables de traitement de fournir aux personnes concernées des informations concises, transparentes, compréhensibles et aisément accessibles concernant le traitement de leurs données ;

4. Considérant qu'en matière d'algorithmes de recommandation, cette obligation de transparence s'étend à l'explication du fonctionnement général de l'algorithme et des critères utilisés pour personnaliser les recommandations ;

5. Considérant que le principe de minimisation des données, prévu à l'article 5 paragraphe 1 point c) du RGPD, exige que les données traitées soient adéquates, pertinentes et limitées à ce qui est nécessaire au regard des finalités pour lesquelles elles sont traitées ;

6. Considérant que la société Plateforme sociale XYZ ne respecte pas ces obligations en refusant de communiquer des informations compréhensibles sur le fonctionnement de ses algorithmes de recommandation et en collectant des données excédant les besoins légitimes de personnalisation ;

DÉCIDE :

Article 1er : La décision implicite de rejet est annulée.

Article 2 : L'affaire est renvoyée à l'Autorité de régulation pour qu'elle procède à un nouvel examen de la demande de mise en demeure.

Article 3 : Il est enjoint à la société Plateforme sociale XYZ de se conformer aux obligations de transparence et de minimisation des données dans un délai de six mois.

Article 4 : La présente décision sera notifiée à l'Association de défense des droits numériques et à la société Plateforme sociale XYZ.

Fait à Paris, le 22 mars 2024.

Le Président,
Sophie Laurent

Les Conseillers,
Marie Dubois
Jean Martin`,
      relatedDecisions: [
        {
          id: 2,
          number: "2024/2",
          title: "Arrêt sur la portabilité des données",
          court: "CJUE",
          date: "2024-02-28",
          description: "Précisions sur le droit à la portabilité...",
          tags: ["Portabilité", "RGPD"],
          importance: "Important",
          importanceColor: "bg-orange-500"
        },
        {
          id: 3,
          number: "2024/3",
          title: "Décision cookies et consentement",
          court: "CNIL",
          date: "2024-01-15",
          description: "Modalités du consentement pour les cookies...",
          tags: ["Cookies", "Consentement"],
          importance: "Standard",
          importanceColor: "bg-blue-500"
        }
      ]
    };
    
    setDecision(sampleDecision);
  }, [id]);

  if (!decision) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse">Chargement de la décision...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto" />
              <h1 className="text-lg md:text-xl font-bold text-primary hidden sm:block">Observatoire des Droits Fondamentaux</h1>
              <h1 className="text-lg font-bold text-primary sm:hidden">ODF</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm w-64"
                />
              </div>
              
              {/* Language Switcher */}
              <div className="flex items-center bg-muted rounded-full p-1">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 py-1 text-sm font-medium">
                  FR
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-transparent rounded-full px-4 py-1 text-sm">
                  AR
                </Button>
              </div>
              
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <nav className="flex flex-col space-y-4 mt-8">
                    <Link to="/" className="text-lg hover:text-primary p-2 rounded-lg hover:bg-muted transition-all">Accueil</Link>
                    <Link to="/observatoire" className="text-lg hover:text-primary p-2 rounded-lg hover:bg-muted transition-all">Observatoire</Link>
                    <a href="#" className="text-lg text-primary p-2 rounded-lg bg-muted">Décisions</a>
                    <a href="#" className="text-lg hover:text-primary p-2 rounded-lg hover:bg-muted transition-all">Fiches pratiques</a>
                    <a href="#" className="text-lg hover:text-primary p-2 rounded-lg hover:bg-muted transition-all">Thématiques</a>
                  </nav>
                </SheetContent>
              </Sheet>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6 ml-4">
                <Link to="/" className="text-sm hover:text-primary transition-colors">Accueil</Link>
                <Link to="/observatoire" className="text-sm hover:text-primary transition-colors">Observatoire</Link>
                <a href="#" className="text-sm text-primary font-medium">Décisions</a>
                <a href="#" className="text-sm hover:text-primary transition-colors">Fiches pratiques</a>
                <a href="#" className="text-sm hover:text-primary transition-colors">Thématiques</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-3 animate-slide-in-right">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Accueil</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/observatoire">Observatoire</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Décision {decision.number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 hover:bg-muted transition-colors" asChild>
          <Link to="/search-results">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour aux résultats
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Decision Header */}
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${decision.importanceColor}`}>
                        {decision.importance}
                      </span>
                      <Badge variant="outline">{decision.caseNumber}</Badge>
                    </div>
                    <CardTitle className="text-2xl">{decision.title}</CardTitle>
                    <CardDescription className="text-base">{decision.summary}</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {decision.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Legal Principles */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Principes juridiques établis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {decision.legalPrinciples?.map((principle, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{principle}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scan Images Section */}
            {decision.scanImages && (
              <ScanImageViewer 
                scanImages={decision.scanImages} 
                title="Document Original Scanné"
              />
            )}

            {/* Full Decision Text */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Texte intégral de la décision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {decision.fullText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-slide-in-right">
            {/* Decision Metadata */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{decision.court}</p>
                    <p className="text-xs text-muted-foreground">Juridiction: {decision.jurisdiction}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{decision.date}</p>
                    <p className="text-xs text-muted-foreground">Date de la décision</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Scale className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Parties</p>
                    <p className="text-xs text-muted-foreground">Demandeur: {decision.parties?.plaintiff}</p>
                    <p className="text-xs text-muted-foreground">Défendeur: {decision.parties?.defendant}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Magistrats</p>
                  {decision.judges?.map((judge, index) => (
                    <p key={index} className="text-xs text-muted-foreground">{judge}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Decisions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Décisions liées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decision.relatedDecisions?.map((related) => (
                  <Link key={related.id} to={`/decision/${related.id}`} className="block">
                    <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{related.court}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${related.importanceColor}`}>
                          {related.importance}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        Arrêt n° {related.number}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {related.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {related.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto mb-4" />
              <h3 className="font-semibold mb-2">Observatoire des Droits Fondamentaux</h3>
              <p className="text-sm text-muted-foreground">
                Facilitant l'accès à la justice et aux droits fondamentaux pour tous
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Institutionnel</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">À propos</a>
                <a href="#" className="block hover:text-primary transition-colors">Mission</a>
                <a href="#" className="block hover:text-primary transition-colors">Équipe</a>
                <a href="#" className="block hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contenus</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">Décisions de justice</a>
                <a href="#" className="block hover:text-primary transition-colors">Fiches pratiques</a>
                <a href="#" className="block hover:text-primary transition-colors">Analyses juridiques</a>
                <a href="#" className="block hover:text-primary transition-colors">Thématiques</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Informations légales</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">Mentions légales</a>
                <a href="#" className="block hover:text-primary transition-colors">Politique de confidentialité</a>
                <a href="#" className="block hover:text-primary transition-colors">Cookies</a>
                <a href="#" className="block hover:text-primary transition-colors">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Observatoire des Droits Fondamentaux. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DecisionDetail;