import AdminContentByType from './AdminContentByType';

// ID du type "Analyses juridiques" dans la base de données
const ANALYSES_TYPE_ID = 'e9fc79ba-d10d-4e58-b4d8-a09dd2f0dae1';

const AdminAnalysesJuridiques = () => {
  return (
    <AdminContentByType
      documentTypeName="Analyse juridique"
      documentTypeId={ANALYSES_TYPE_ID}
      title="Gestion des Analyses Juridiques"
      description="Gérez vos analyses et études juridiques"
    />
  );
};

export default AdminAnalysesJuridiques;
