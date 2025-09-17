import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, Filter, Calendar, Scale, Building, FileText, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const RechercheAvancee = () => {
  const fondamentalRights = [
    "Droit à la vie", "Droit à la liberté", "Droit à la sécurité", "Droit au respect de la vie privée",
    "Droit au logement", "Droit au travail", "Droit à la santé", "Droit à l'éducation",
    "Liberté d'expression", "Liberté de religion", "Droit à un procès équitable", "Non-discrimination"
  ];

  const jurisdictions = [
    "Cour constitutionnelle", "Cour de cassation", "Conseil d'État", "Cour d'appel de Casablanca",
    "Cour d'appel de Rabat", "Tribunal administratif de Casablanca", "Tribunal de première instance",
    "Tribunal de famille", "Cour européenne des droits de l'homme", "Comité des droits de l'homme ONU"
  ];

  const decisionTypes = [
    "Arrêt", "Jugement", "Ordonnance", "Décision", "Avis", "Recommandation"
  ];

  const subjects = [
    "Droit civil", "Droit pénal", "Droit administratif", "Droit du travail", 
    "Droit de la famille", "Droit commercial", "Droit constitutionnel", "Droit international"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/observatoire" className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Observatoire des Droits Fondamentaux</h1>
                <p className="text-sm text-muted-foreground">Recherche avancée</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">العربية</Button>
              <Link to="/acces-aux-droits">
                <Button variant="ghost" size="sm">Accès aux Droits</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/observatoire">Observatoire</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Recherche avancée</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Recherche avancée</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Recherche multicritères dans la base documentaire de l'Observatoire
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Critères de recherche
                </CardTitle>
                <CardDescription>
                  Affinez votre recherche avec les filtres ci-dessous
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Search */}
                <div className="space-y-2">
                  <Label htmlFor="search-text">Recherche textuelle</Label>
                  <Input 
                    id="search-text"
                    placeholder="Mots-clés, références..."
                  />
                </div>

                {/* Fundamental Rights */}
                <div className="space-y-2">
                  <Label>Droits fondamentaux</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un droit" />
                    </SelectTrigger>
                    <SelectContent>
                      {fondamentalRights.map((right) => (
                        <SelectItem key={right} value={right.toLowerCase().replace(/\s+/g, '-')}>
                          {right}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Jurisdiction */}
                <div className="space-y-2">
                  <Label>Juridiction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une juridiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map((jurisdiction) => (
                        <SelectItem key={jurisdiction} value={jurisdiction.toLowerCase().replace(/\s+/g, '-')}>
                          {jurisdiction}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Decision Type */}
                <div className="space-y-2">
                  <Label>Type de décision</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de décision" />
                    </SelectTrigger>
                    <SelectContent>
                      {decisionTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label>Matière juridique</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject.toLowerCase().replace(/\s+/g, '-')}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Période</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="Date début" />
                    <Input type="date" placeholder="Date fin" />
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lang-fr" defaultChecked />
                      <Label htmlFor="lang-fr">Français</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lang-ar" />
                      <Label htmlFor="lang-ar">Arabe</Label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Lancer la recherche
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Search Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Résultats de recherche</CardTitle>
                  <CardDescription>
                    Saisissez vos critères et lancez une recherche pour voir les résultats ici
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune recherche lancée</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Utilisez les filtres à gauche pour rechercher dans notre base documentaire de plus de 15,000 décisions
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Search Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Exemples de recherches</CardTitle>
                  <CardDescription>
                    Découvrez quelques recherches populaires pour vous inspirer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Discrimination au travail",
                        description: "Jurisprudence sur les discriminations professionnelles",
                        filters: "Droit au travail • Cour de cassation • 2020-2024"
                      },
                      {
                        title: "Droit au logement social",
                        description: "Décisions relatives aux refus de logement",
                        filters: "Droit au logement • Tribunal administratif • Dernière année"
                      },
                      {
                        title: "Liberté d'expression",
                        description: "Limites de la liberté d'expression en ligne",
                        filters: "Liberté d'expression • Toutes juridictions • 2022-2024"
                      },
                      {
                        title: "Droit à la santé",
                        description: "Accès aux soins et refus de traitement",
                        filters: "Droit à la santé • Cour d'appel • Toute période"
                      }
                    ].map((example, index) => (
                      <Card key={index} className="border-l-4 border-l-primary/30 hover:border-l-primary transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{example.title}</CardTitle>
                          <CardDescription className="text-sm">{example.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground mb-3">{example.filters}</p>
                          <Button size="sm" variant="outline">
                            Utiliser cette recherche
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Base documentaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15,247</div>
                    <p className="text-sm text-muted-foreground">décisions référencées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Scale className="h-5 w-5 text-primary" />
                      Droits couverts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">35</div>
                    <p className="text-sm text-muted-foreground">droits fondamentaux</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Juridictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">127</div>
                    <p className="text-sm text-muted-foreground">instances couvertes</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechercheAvancee;