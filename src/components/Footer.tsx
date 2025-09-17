import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Shield, Users, Mail, FileText, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = [
    {
      title: "Information",
      items: [
        {
          path: "/information/qui-sommes-nous",
          label: "Qui sommes-nous",
          icon: Users,
        },
        {
          path: "/information/actualites",
          label: "Actualités",
          icon: FileText,
        },
        {
          path: "/information/faq-chatbot",
          label: "FAQ / Chatbot",
          icon: MessageSquare,
        }
      ]
    }
  ];

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg mb-4 text-foreground">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-auto py-3 px-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Observatoire des Droits Fondamentaux (ODF). Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;