import NewsEditor from "@/components/admin/NewsEditor";

const AdminActualites = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestion des Actualités</h2>
        <p className="text-muted-foreground">
          Créer et gérer les actualités de l'Observatoire des Droits
        </p>
      </div>
      <NewsEditor />
    </div>
  );
};

export default AdminActualites;
