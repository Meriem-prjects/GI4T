import AdminContentByType from './AdminContentByType';

// ID du type "Fiche de jurisprudence" dans la base de données
const FICHES_TYPE_ID = 'e5f9c4af-6860-4b52-821d-a7e133934686';

const AdminFichesJurisprudence = () => {
  return (
    <AdminContentByType
      documentTypeName="Fiche de jurisprudence"
      documentTypeId={FICHES_TYPE_ID}
      title="Gestion des Fiches de Jurisprudence"
      description="Gérez vos fiches de jurisprudence"
    />
  );
};

export default AdminFichesJurisprudence;
