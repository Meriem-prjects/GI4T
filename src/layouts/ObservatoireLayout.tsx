import { Outlet } from "react-router-dom";
import ObservatoireNav from "@/components/ObservatoireNav";
import ObservatoireHeader from "@/components/ObservatoireHeader";
import Footer from "@/components/Footer";

const ObservatoireLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ObservatoireHeader />

      {/* Navigation */}
      <ObservatoireNav />

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ObservatoireLayout;