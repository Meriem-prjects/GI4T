import AdminContentByType from './AdminContentByType';

// ID du type "Blog" dans la base de données
const BLOG_TYPE_ID = 'dd7b55de-4ece-41de-959e-b3015ea1cb9e';

const AdminBlogs = () => {
  return (
    <AdminContentByType
      documentTypeName="Blog"
      documentTypeId={BLOG_TYPE_ID}
      title="Gestion des Blogs"
      description="Gérez vos articles de blog"
    />
  );
};

export default AdminBlogs;
