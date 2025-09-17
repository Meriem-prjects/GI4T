import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, MessageCircle, Share2, Heart, Eye, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";

const ReseauxSociaux = () => {
  const socialPlatforms = [
    {
      name: "Facebook",
      handle: "@ODFTunisie",
      followers: "15.2K",
      description: "Actualités, campagnes et témoignages sur les droits fondamentaux",
      color: "bg-blue-600",
      url: "https://facebook.com/ODFTunisie",
      icon: "📘",
      engagement: "850 interactions/semaine"
    },
    {
      name: "Twitter/X", 
      handle: "@ODF_Tunisie",
      followers: "8.7K",
      description: "Informations en temps réel et débats sur les droits civiques",
      color: "bg-black",
      url: "https://twitter.com/ODF_Tunisie", 
      icon: "𝕏",
      engagement: "420 interactions/semaine"
    },
    {
      name: "Instagram",
      handle: "@odf.tunisie",
      followers: "12.1K",
      description: "Contenus visuels de nos campagnes et événements",
      color: "bg-gradient-to-tr from-purple-600 to-pink-600",
      url: "https://instagram.com/odf.tunisie",
      icon: "📷",
      engagement: "680 interactions/semaine"
    },
    {
      name: "LinkedIn",
      handle: "ODF Tunisie",
      followers: "3.4K", 
      description: "Réseau professionnel et partenariats institutionnels",
      color: "bg-blue-700",
      url: "https://linkedin.com/company/odf-tunisie",
      icon: "💼",
      engagement: "180 interactions/semaine"
    },
    {
      name: "YouTube",
      handle: "ODF Tunisie",
      followers: "5.8K",
      description: "Vidéos éducatives et témoignages sur les droits",
      color: "bg-red-600",
      url: "https://youtube.com/@ODFTunisie",
      icon: "📺",
      engagement: "1.2K vues/semaine"
    }
  ];

  const recentPosts = [
    {
      platform: "Facebook",
      content: "🏛️ Nouvelle publication : Guide pratique pour contester une décision administrative. Téléchargement gratuit sur notre site.",
      date: "Il y a 2 heures",
      engagement: { likes: 45, shares: 12, comments: 8 },
      image: "/api/placeholder/300/200"
    },
    {
      platform: "Twitter/X", 
      content: "📊 Selon notre dernière étude, 68% des citoyens ne connaissent pas leurs droits de recours administratif. Il est temps de changer cela ! #DroitsFondamentaux #Tunisie",
      date: "Il y a 4 heures",
      engagement: { likes: 23, shares: 15, comments: 5 }
    },
    {
      platform: "Instagram",
      content: "✨ Retour en images sur notre campagne à Sfax ! Merci à tous les participants pour leur engagement.",
      date: "Il y a 6 heures", 
      engagement: { likes: 89, shares: 6, comments: 12 },
      image: "/api/placeholder/300/300"
    },
    {
      platform: "LinkedIn",
      content: "🤝 Partenariat renforcé avec Democracy Reporting International pour développer de nouveaux outils d'aide aux citoyens.",
      date: "Il y a 1 jour",
      engagement: { likes: 34, shares: 8, comments: 3 }
    }
  ];

  const campaigns = [
    {
      title: "#ConnaîtreSesDoits",
      description: "Campagne de sensibilisation aux droits administratifs",
      platforms: ["Facebook", "Instagram", "Twitter"],
      reach: "50K personnes touchées",
      status: "En cours"
    },
    {
      title: "#JusticeAccessible", 
      description: "Promotion de l'accès gratuit à la justice",
      platforms: ["Facebook", "LinkedIn", "YouTube"],
      reach: "35K personnes touchées",
      status: "Terminée"
    },
    {
      title: "#DroitsDesFemmes",
      description: "Sensibilisation aux droits des femmes en Tunisie",
      platforms: ["Instagram", "Facebook", "Twitter"],
      reach: "28K personnes touchées", 
      status: "En cours"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/Feelinx_upload/odf-logo.png" alt="ODF Logo" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Réseaux Sociaux</h1>
                <p className="text-sm text-muted-foreground">Suivez-nous et participez au débat</p>
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
              <BreadcrumbPage>Réseaux Sociaux</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Suivez l'ODF sur les Réseaux Sociaux</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Restez informé de nos actions, participez aux débats et accédez à du contenu exclusif sur les droits fondamentaux.
          </p>
          
          {/* Global Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">45.2K</div>
              <div className="text-sm text-muted-foreground">Abonnés total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2.1K</div>
              <div className="text-sm text-muted-foreground">Interactions/semaine</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">125K</div>
              <div className="text-sm text-muted-foreground">Portée mensuelle</div>
            </div>
          </div>
        </div>

        {/* Social Platforms */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6">Nos Plateformes</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialPlatforms.map((platform, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-white text-xl`}>
                        {platform.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{platform.handle}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{platform.followers}</Badge>
                  </div>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Engagement :</span>
                      <span className="font-medium">{platform.engagement}</span>
                    </div>
                    <Button asChild className="w-full">
                      <a href={platform.url} target="_blank" rel="noopener noreferrer">
                        Suivre <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6">Publications Récentes</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {recentPosts.map((post, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{post.platform}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt="Post image"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-sm mb-4">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.engagement.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {post.engagement.shares}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.engagement.comments}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Campaigns */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6">Campagnes en Cours</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <Badge variant={campaign.status === "En cours" ? "default" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Plateformes :</p>
                      <div className="flex flex-wrap gap-1">
                        {campaign.platforms.map((platform, pIndex) => (
                          <Badge key={pIndex} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{campaign.reach}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Restez connecté</CardTitle>
            <CardDescription>
              Ne manquez aucune de nos publications et événements
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>Suivre sur Facebook</Button>
              <Button variant="outline">Suivre sur Twitter</Button>
              <Button variant="outline">S'abonner à la newsletter</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReseauxSociaux;