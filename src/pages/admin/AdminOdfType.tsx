import AdminContentByType from './AdminContentByType';
import { odfType, type OdfTypeKey } from '@/lib/odf';

// Gestion des types de documents ajoutés avec l'import des documents ODF
// « avec page de garde » (articles, recueils, notes thématiques…). Le type
// est retrouvé par son nom en base.
const AdminOdfType = ({ typeKey }: { typeKey: OdfTypeKey }) => {
  const type = odfType(typeKey);
  return (
    <AdminContentByType
      key={typeKey}
      documentTypeName={type.dbName}
      title={`Gestion : ${type.label.fr}`}
      description={type.description.fr}
    />
  );
};

export default AdminOdfType;
