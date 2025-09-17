import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Message envoyé",
      description: "Nous vous répondrons dans les plus brefs délais"
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contactInfo = [
    {
      title: "Adresse",
      content: "Avenue Habib Bourguiba, 1000 Tunis, Tunisie",
      icon: MapPin
    },
    {
      title: "Téléphone",
      content: "+216 71 123 456",
      icon: Phone
    },
    {
      title: "Email",
      content: "contact@odf.tn",
      icon: Mail
    },
    {
      title: "Horaires",
      content: "Lun-Ven: 8h30-17h30",
      icon: Clock
    }
  ];

  const contactTypes = [
    {
      title: "Demande d'information",
      description: "Questions générales sur l'ODF et ses activités",
      icon: MessageSquare
    },
    {
      title: "Partenariat",
      description: "Propositions de collaboration et partenariats",
      icon: Users
    },
    {
      title: "Contribution",
      description: "Proposer du contenu ou signaler des erreurs",
      icon: BookOpen
    }
  ];

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
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-sm hover:text-primary transition-colors">Accueil</Link>
                <Link to="/observatoire" className="text-sm hover:text-primary transition-colors">Observatoire</Link>
                <Link to="/textes-fondamentaux" className="text-sm hover:text-primary transition-colors">Textes fondamentaux</Link>
                <Link to="/analyses-opinions" className="text-sm hover:text-primary transition-colors">Analyses & Opinions</Link>
                <Link to="/actualites" className="text-sm hover:text-primary transition-colors">Actualités</Link>
                <a href="#" className="text-sm text-primary font-medium">Contact</a>
              </nav>
              
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
              <BreadcrumbPage>Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Nous Contacter</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Une question, une suggestion, ou souhaitez-vous collaborer avec nous ? 
            N'hésitez pas à nous contacter. Notre équipe vous répondra rapidement.
          </p>
        </section>

        {/* Contact Types */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Pourquoi nous contacter ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.title} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Send className="w-6 h-6 text-primary" />
                  Formulaire de Contact
                </CardTitle>
                <CardDescription>
                  Remplissez ce formulaire et nous vous répondrons dans les plus brefs délais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type">Type de demande</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de votre demande" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="information">Demande d'information</SelectItem>
                        <SelectItem value="partenariat">Proposition de partenariat</SelectItem>
                        <SelectItem value="contribution">Contribution/Correction</SelectItem>
                        <SelectItem value="presse">Services de presse</SelectItem>
                        <SelectItem value="technique">Support technique</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Résumé de votre demande"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Décrivez votre demande en détail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">Informations de Contact</CardTitle>
                <CardDescription>
                  Vous pouvez également nous joindre directement via ces coordonnées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.title} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{info.title}</h4>
                        <p className="text-muted-foreground">{info.content}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Notre localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Carte interactive</p>
                    <p className="text-xs">Avenue Habib Bourguiba, 1000 Tunis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-12 bg-muted/50 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Questions Fréquentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Combien de temps pour une réponse ?</h4>
              <p className="text-sm text-muted-foreground">
                Nous nous engageons à répondre dans un délai de 48h ouvrées maximum.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Puis-je proposer du contenu ?</h4>
              <p className="text-sm text-muted-foreground">
                Oui, nous acceptons les contributions d'experts. Contactez-nous pour plus d'informations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Les services sont-ils gratuits ?</h4>
              <p className="text-sm text-muted-foreground">
                L'accès aux contenus de l'ODF est entièrement gratuit pour tous les utilisateurs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Comment signaler une erreur ?</h4>
              <p className="text-sm text-muted-foreground">
                Utilisez le formulaire en spécifiant "Contribution/Correction" comme type de demande.
              </p>
            </div>
          </div>
        </section>
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
              <h3 className="font-semibold mb-4">Navigation</h3>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block hover:text-primary transition-colors">Accueil</Link>
                <Link to="/observatoire" className="block hover:text-primary transition-colors">Observatoire</Link>
                <Link to="/search-results" className="block hover:text-primary transition-colors">Recherche</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contenus</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">Décisions de justice</a>
                <Link to="/textes-fondamentaux" className="block hover:text-primary transition-colors">Textes fondamentaux</Link>
                <Link to="/analyses-opinions" className="block hover:text-primary transition-colors">Analyses & Opinions</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Informations</h3>
              <div className="space-y-2 text-sm">
                <Link to="/odf-partenaires" className="block hover:text-primary transition-colors">À propos</Link>
                <Link to="/contact" className="block hover:text-primary transition-colors">Contact</Link>
                <a href="#" className="block hover:text-primary transition-colors">Mentions légales</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Observatoire des Droits Fondamentaux. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;