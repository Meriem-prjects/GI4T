import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AccesDroitsProtectedRouteProps {
  children: React.ReactNode;
}

const AccesDroitsProtectedRoute = ({ children }: AccesDroitsProtectedRouteProps) => {
  const { user, loading, isAccesDroitsAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/acces-aux-droits/login" state={{ from: location }} replace />;
  }

  if (!isAccesDroitsAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-900 mb-2">Accès refusé</h1>
          <p className="text-yellow-600">Vous n'avez pas les droits d'accès à l'espace Accès aux Droits.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccesDroitsProtectedRoute;
