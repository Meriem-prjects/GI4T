import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, Download, Bookmark, Share2, Calendar, Building, Scale, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { Decision } from "@/types/decision";

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
      title: "Protection des données personnelles",
      court: "Cour Suprême",
      date: "15 janvier 2024",
      description: "Cette décision établit les principes fondamentaux du traitement des données personnelles en matière de droits fondamentaux.",
      tags: ["Vie privée", "RGPD", "Données personnelles"],
      importance: "Majeure",
      importanceColor: "bg-red-100 text-red-800",
      caseNumber: "CS-2024-0147",
      jurisdiction: "Nationale",
      judges: ["Mme Justice Fatima Al-Rashid", "M. Justice Mohamed Benali", "Mme Justice Aicha Zemmouri"],
      parties: {
        plaintiff: "Association de Défense des Droits Numériques",
        defendant: "Ministère de l'Intérieur"
      },
      summary: "La Cour Suprême établit dans cette décision historique les limites constitutionnelles du traitement des données personnelles par les administrations publiques, renforçant ainsi la protection de la vie privée des citoyens dans l'ère numérique.",
      legalPrinciples: [
        "Principe de proportionnalité dans le traitement des données",
        "Consentement éclairé et libre",
        "Droit à l'oubli numérique",
        "Transparence des algorithmes publics"
      ],
      fullText: `
        ARRÊT DE LA COUR SUPRÊME
        
        Séance publique du 15 janvier 2024
        
        RÉPUBLIQUE [...]
        
        AU NOM DU PEUPLE
        
        LA COUR SUPRÊME
        
        VU les dispositions constitutionnelles relatives aux droits fondamentaux ;
        VU la loi n° XX-XX relative à la protection des données à caractère personnel ;
        
        ATTENDU que l'Association de Défense des Droits Numériques conteste la légalité du système de surveillance mis en place par le Ministère de l'Intérieur ;
        
        ATTENDU que le droit à la vie privée, consacré par l'article 24 de la Constitution, impose des limites strictes à toute ingérence de l'État dans la sphère privée des individus ;
        
        CONSIDÉRANT que le traitement automatisé des données personnelles doit respecter les principes de nécessité, de proportionnalité et de finalité ;
        
        CONSIDÉRANT que tout système de surveillance doit être encadré par des garanties procédurales et être soumis à un contrôle judiciaire effectif ;
        
        PAR CES MOTIFS :
        
        DÉCLARE que le système de surveillance contesté porte atteinte de manière disproportionnée au droit à la vie privée ;
        
        ORDONNE au Ministère de l'Intérieur de modifier son système dans un délai de six mois ;
        
        ÉTABLIT les principes suivants :
        
        1. Principe de proportionnalité : Tout traitement de données doit être strictement nécessaire à la finalité poursuivie.
        
        2. Consentement éclairé : Les citoyens doivent être informés de manière claire et complète de l'utilisation de leurs données.
        
        3. Droit à l'oubli : Toute personne a le droit d'obtenir l'effacement de ses données personnelles dans certaines conditions.
        
        4. Transparence algorithmique : Les algorithmes utilisés par les administrations publiques doivent être transparents et auditables.
        
        ORDONNE la publication de cet arrêt au Journal Officiel.
        
        Ainsi jugé et prononcé publiquement le 15 janvier 2024.
        
        La Présidente : Mme Justice Fatima Al-Rashid
        Les Conseillers : M. Justice Mohamed Benali, Mme Justice Aicha Zemmouri
      `,
      relatedDecisions: [
        {
          id: 2,
          number: "2023/089",
          title: "Liberté d'expression en ligne",
          court: "Cour d'Appel",
          date: "12 décembre 2023",
          description: "Analyse des limites de la liberté d'expression sur les plateformes numériques...",
          tags: ["Expression", "Numérique"],
          importance: "Important",
          importanceColor: "bg-yellow-100 text-yellow-800"
        },
        {
          id: 3,
          number: "2023/156",
          title: "Surveillance et sécurité nationale",
          court: "Cour Constitutionnelle",
          date: "20 novembre 2023",
          description: "Équilibre entre sécurité nationale et droits individuels...",
          tags: ["Sécurité", "Surveillance"],
          importance: "Majeure",
          importanceColor: "bg-red-100 text-red-800"
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-8 w-auto" />
              <h1 className="text-lg md:text-xl font-bold text-primary hidden sm:block">Observatoire des Droits Fondamentaux</h1>
            </div>
            
            <div className="flex items-center space-x-6">
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
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/search-results">Résultats de recherche</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Arrêt n° {decision.number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/search-results">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour aux résultats
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Decision Header */}
            <Card>
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
                  <div className="flex gap-2">
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
                <div className="flex gap-2 mb-4">
                  {decision.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Legal Principles */}
            <Card>
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

            {/* Full Decision Text */}
            <Card>
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
          <div className="space-y-6">
            {/* Decision Metadata */}
            <Card>
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