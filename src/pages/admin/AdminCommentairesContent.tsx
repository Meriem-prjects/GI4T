import AdminContentByType from './AdminContentByType';

// ID du type "Commentaires" dans la base de données
const COMMENTAIRES_TYPE_ID = 'ac21f74d-174e-4f46-b60c-d5f68ad79a8c';

const AdminCommentairesContent = () => {
  return (
    <AdminContentByType
      documentTypeName="Commentaire"
      documentTypeId={COMMENTAIRES_TYPE_ID}
      title="Gestion des Commentaires"
      description="Gérez vos commentaires juridiques"
    />
  );
};

export default AdminCommentairesContent;
