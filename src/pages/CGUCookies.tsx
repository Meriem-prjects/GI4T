import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Shield, Cookie, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";

const CGUCookies = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">CGU & Cookies</h1>
                <p className="text-sm text-muted-foreground">Conditions générales et politique des cookies</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="ghost" size="sm">Observatoire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AccesAuxDroitsNav />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/acces-aux-droits">Accès aux Droits</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>CGU & Cookies</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Conditions Générales d'Utilisation & Politique des Cookies</h2>
          <p className="text-lg text-muted-foreground">
            Informations légales sur l'utilisation de notre site et le traitement de vos données.
          </p>
        </div>

        <Tabs defaultValue="cgu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cgu" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CGU
            </TabsTrigger>
            <TabsTrigger value="cookies" className="flex items-center gap-2">
              <Cookie className="h-4 w-4" />
              Cookies
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Confidentialité
            </TabsTrigger>
          </TabsList>

          {/* CGU Tab */}
          <TabsContent value="cgu">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Conditions Générales d'Utilisation
                </CardTitle>
                <CardDescription>
                  Dernière mise à jour : 15 mars 2024
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold mb-3">1. Objet</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site web de l'Observatoire des Droits Fondamentaux (ODF) accessible à l'adresse [URL du site]. L'utilisation du site implique l'acceptation pleine et entière des présentes CGU.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">2. Éditeur du site</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p><strong>Observatoire des Droits Fondamentaux (ODF)</strong></p>
                      <p>Adresse : [Adresse complète], Tunis, Tunisie</p>
                      <p>Email : contact@odf.tn</p>
                      <p>Téléphone : +216 XX XX XX XX</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">3. Accès au site</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      L'accès au site est gratuit et ouvert à tous. L'éditeur se réserve le droit de modifier, suspendre ou interrompre l'accès au site à tout moment et sans préavis pour des raisons techniques ou de maintenance.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">4. Utilisation du site</h3>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>L'utilisateur s'engage à utiliser le site dans le respect de la législation en vigueur</li>
                      <li>Il est interdit de porter atteinte au bon fonctionnement du site</li>
                      <li>Toute utilisation commerciale des contenus est interdite sans autorisation</li>
                      <li>L'utilisateur s'engage à ne pas diffuser de contenus illégaux ou contraires aux bonnes mœurs</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">5. Propriété intellectuelle</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Le contenu du site (textes, images, graphismes, logo, icônes, vidéos) est protégé par le droit d'auteur. Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces éléments est strictement interdite sans l'accord écrit de l'ODF.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">6. Responsabilité</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      L'ODF met tout en œuvre pour fournir des informations exactes et mises à jour. Cependant, elle ne peut être tenue responsable des erreurs, omissions ou résultats qui pourraient être obtenus par l'utilisation de ces informations.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">7. Droit applicable</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Les présentes CGU sont soumises au droit tunisien. Tout litige sera porté devant les tribunaux compétents de Tunis.
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cookies Tab */}
          <TabsContent value="cookies">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cookie className="h-5 w-5 text-primary" />
                    Politique des Cookies
                  </CardTitle>
                  <CardDescription>
                    Gestion et préférences des cookies sur notre site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Qu'est-ce qu'un cookie ?</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de la visite d'un site web. Il permet de reconnaître votre navigateur et de mémoriser certaines informations vous concernant.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Types de cookies utilisés</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Cookies essentiels</h4>
                            <p className="text-sm text-muted-foreground">Nécessaires au fonctionnement du site</p>
                          </div>
                          <Switch checked disabled />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Cookies analytiques</h4>
                            <p className="text-sm text-muted-foreground">Statistiques d'utilisation anonymes</p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Cookies fonctionnels</h4>
                            <p className="text-sm text-muted-foreground">Amélioration de l'expérience utilisateur</p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Cookies publicitaires</h4>
                            <p className="text-sm text-muted-foreground">Publicités personnalisées</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </section>

                    <div className="flex gap-3">
                      <Button>Accepter tous les cookies</Button>
                      <Button variant="outline">Accepter la sélection</Button>
                      <Button variant="outline">Refuser tous</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gestion des cookies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Vous pouvez à tout moment modifier vos préférences concernant les cookies dans les paramètres de votre navigateur :
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                      <li><strong>Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
                      <li><strong>Firefox :</strong> Options &gt; Vie privée et sécurité &gt; Cookies</li>
                      <li><strong>Safari :</strong> Préférences &gt; Confidentialité &gt; Cookies</li>
                      <li><strong>Edge :</strong> Paramètres &gt; Cookies et autorisations de site</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Politique de Confidentialité
                </CardTitle>
                <CardDescription>
                  Protection et traitement de vos données personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold mb-3">1. Responsable du traitement</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      L'Observatoire des Droits Fondamentaux (ODF) est responsable du traitement de vos données personnelles collectées sur ce site web.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">2. Données collectées</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Nous collectons les données suivantes :
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Données de navigation (adresse IP, navigateur, pages visitées)</li>
                      <li>Données de contact (nom, email) lors de l'inscription à la newsletter</li>
                      <li>Données des formulaires de contact</li>
                      <li>Cookies de fonctionnement et d'analyse</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">3. Finalités du traitement</h3>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Amélioration du fonctionnement du site</li>
                      <li>Envoi de newsletters et d'informations</li>
                      <li>Réponse aux demandes de contact</li>
                      <li>Analyse statistique de l'audience</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">4. Vos droits</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Conformément à la législation sur la protection des données, vous disposez des droits suivants :
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Droit d'accès à vos données</li>
                      <li>Droit de rectification</li>
                      <li>Droit à l'effacement</li>
                      <li>Droit à la portabilité</li>
                      <li>Droit d'opposition</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">5. Conservation des données</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, conformément à nos obligations légales.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold mb-3">6. Contact</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-muted-foreground">
                        Pour exercer vos droits ou pour toute question concernant le traitement de vos données personnelles, contactez-nous à : 
                        <strong> privacy@odf.tn</strong>
                      </p>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Last Update */}
        <Card className="mt-8 bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Dernière mise à jour : 15 mars 2024</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CGUCookies;