import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Scale, Shield, Eye, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const MentionsLegales = () => {
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
                <p className="text-sm text-muted-foreground">Mentions légales</p>
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
              <BreadcrumbPage>Mentions légales</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Mentions légales</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Informations légales relatives à l'Observatoire des Droits Fondamentaux
          </p>
        </div>

        <div className="space-y-8">
          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Identification de l'éditeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Raison sociale</h4>
                <p className="text-muted-foreground">Observatoire des Droits Fondamentaux (ODF)</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Forme juridique</h4>
                <p className="text-muted-foreground">Association à but non lucratif</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Siège social</h4>
                <p className="text-muted-foreground">
                  Faculté de Droit, Université Mohammed V<br />
                  Avenue des Nations Unies, Agdal<br />
                  10000 Rabat, Maroc
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Directeur de publication</h4>
                <p className="text-muted-foreground">Pr. Amina Benali, Directrice scientifique</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Contact</h4>
                <p className="text-muted-foreground">
                  Email: contact@odf-morocco.org<br />
                  Téléphone: +212 5 37 77 XX XX
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Hébergement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Hébergeur</h4>
                <p className="text-muted-foreground">
                  Feelinx Digital Solutions<br />
                  123 Avenue Hassan II<br />
                  20000 Casablanca, Maroc<br />
                  Téléphone: +212 5 22 XX XX XX
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Droits d'auteur</h4>
                <p className="text-muted-foreground leading-relaxed">
                  L'ensemble de ce site relève de la législation marocaine et internationale sur le droit d'auteur 
                  et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les 
                  documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Licence des contenus</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Les analyses et contenus produits par l'ODF sont mis à disposition sous licence Creative Commons 
                  Attribution - Pas d'Utilisation Commerciale - Partage dans les Mêmes Conditions 4.0 International, 
                  sauf mention contraire explicite.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Marques</h4>
                <p className="text-muted-foreground leading-relaxed">
                  La dénomination "Observatoire des Droits Fondamentaux" ainsi que le logo ODF sont des marques 
                  déposées. Toute utilisation non autorisée est interdite.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Données personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Protection des données personnelles</CardTitle>
              <CardDescription>
                Conformément au droit marocain et aux standards internationaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Collecte des données</h4>
                <p className="text-muted-foreground leading-relaxed">
                  L'ODF collecte uniquement les données personnelles nécessaires au fonctionnement de ses services :
                </p>
                <ul className="mt-2 ml-4 space-y-1 text-muted-foreground">
                  <li>• Données de connexion (cookies techniques)</li>
                  <li>• Informations de contact (formulaires)</li>
                  <li>• Données d'utilisation (statistiques anonymisées)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Finalités du traitement</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Les données collectées servent exclusivement à :
                </p>
                <ul className="mt-2 ml-4 space-y-1 text-muted-foreground">
                  <li>• Assurer le fonctionnement technique du site</li>
                  <li>• Répondre aux demandes d'information</li>
                  <li>• Améliorer la qualité de nos services</li>
                  <li>• Établir des statistiques d'usage anonymes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Droits des utilisateurs</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Conformément à la loi marocaine, vous disposez d'un droit d'accès, de rectification et de 
                  suppression des données vous concernant. Pour exercer ces droits, contactez-nous à l'adresse : 
                  privacy@odf-morocco.org
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle>Limitation de responsabilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contenu du site</h4>
                <p className="text-muted-foreground leading-relaxed">
                  L'ODF s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
                  Cependant, l'ODF ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations 
                  mises à disposition.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Liens externes</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Ce site peut contenir des liens vers d'autres sites internet. L'ODF n'exerce aucun contrôle 
                  sur ces sites et décline toute responsabilité quant à leur contenu.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Disponibilité du service</h4>
                <p className="text-muted-foreground leading-relaxed">
                  L'ODF s'efforce d'assurer une disponibilité continue du site, mais ne peut garantir un accès 
                  ininterrompu en raison des contraintes techniques inhérentes à internet.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Droit applicable */}
          <Card>
            <CardHeader>
              <CardTitle>Droit applicable et juridiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Loi applicable</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Les présentes mentions légales sont soumises au droit marocain. En cas de litige, 
                  les tribunaux marocains seront seuls compétents.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Médiation</h4>
                <p className="text-muted-foreground leading-relaxed">
                  En cas de différend, l'ODF privilégie la résolution amiable et peut recourir à la médiation 
                  avant toute action judiciaire.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact
              </CardTitle>
              <CardDescription>
                Pour toute question concernant ces mentions légales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Questions générales :</strong> contact@odf-morocco.org<br />
                    <strong>Protection des données :</strong> privacy@odf-morocco.org<br />
                    <strong>Signalement de contenu :</strong> legal@odf-morocco.org
                  </p>
                </div>
                <div>
                  <Link to="/contact">
                    <Button>Nous contacter</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update info */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Dernière mise à jour des mentions légales : Mars 2024</p>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;