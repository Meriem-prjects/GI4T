const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Contactez-nous
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Mentions légales
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Plan du site
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Réseaux sociaux
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            CGU / cookies
          </a>
        </div>
        
        <div className="border-t mt-6 pt-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Observatoire des Droits Fondamentaux (ODF). Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;