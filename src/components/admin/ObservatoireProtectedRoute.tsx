import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ObservatoireProtectedRouteProps {
  children: React.ReactNode;
}

const ObservatoireProtectedRoute = ({ children }: ObservatoireProtectedRouteProps) => {
  const { user, loading, isObservatoireAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/observatoire/login" state={{ from: location }} replace />;
  }

  if (!isObservatoireAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Accès refusé</h1>
          <p className="text-blue-600">Vous n'avez pas les droits d'accès à l'espace Observatoire.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ObservatoireProtectedRoute;
