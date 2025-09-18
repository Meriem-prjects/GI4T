import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, FileCheck, Archive, TrendingUp, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PDFAStatistics {
  total_documents: number;
  pdfa_documents: number;
  pdfa_percentage: number;
  pdfa_versions: Record<string, number>;
}

const PDFAOptimizer: React.FC = () => {
  const { toast } = useToast();
  const [statistics, setStatistics] = useState<PDFAStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPDFAStatistics();
  }, []);

  const loadPDFAStatistics = async () => {
    try {
      setLoading(true);
      
      // Call the PostgreSQL function to get PDF/A statistics
      const { data, error } = await supabase.rpc('get_pdfa_statistics');
      
      if (error) {
        console.error('Error loading PDF/A statistics:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les statistiques PDF/A.",
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0) {
        const stats = data[0];
        setStatistics({
          total_documents: stats.total_documents,
          pdfa_documents: stats.pdfa_documents,
          pdfa_percentage: stats.pdfa_percentage,
          pdfa_versions: (stats.pdfa_versions as Record<string, number>) || {}
        });
      }
    } catch (error) {
      console.error('Exception loading PDF/A statistics:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement des statistiques.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPDFVersionBadgeVariant = (version: string) => {
    if (version.includes('PDF/A-1')) return 'default';
    if (version.includes('PDF/A-2')) return 'secondary';
    if (version.includes('PDF/A-3')) return 'outline';
    return 'destructive'; // For Non-PDF/A
  };

  const formatPercentage = (value: number) => {
    return isNaN(value) ? '0' : value.toFixed(1);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Optimisation PDF/A
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Chargement des statistiques...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* PDF/A Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Optimisation PDF/A - Vue d'ensemble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Optimisation activée</AlertTitle>
            <AlertDescription>
              Le système détecte automatiquement les documents PDF/A et optimise leur traitement 
              avec une résolution de 300 DPI et une préservation complète des métadonnées.
            </AlertDescription>
          </Alert>

          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Documents Total</p>
                    <p className="text-2xl font-bold">{statistics.total_documents}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">PDF/A Détectés</p>
                    <p className="text-2xl font-bold text-green-800">{statistics.pdfa_documents}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Taux de Conformité</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatPercentage(statistics.pdfa_percentage)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF/A Progress and Versions */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse par Version PDF/A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conformité PDF/A globale</span>
                <span>{formatPercentage(statistics.pdfa_percentage)}%</span>
              </div>
              <Progress 
                value={statistics.pdfa_percentage || 0} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Répartition par Version</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(statistics.pdfa_versions).map(([version, count]) => (
                  <div key={version} className="flex items-center justify-between p-2 bg-muted rounded">
                    <Badge variant={getPDFVersionBadgeVariant(version)} className="text-xs">
                      {version}
                    </Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF/A Features */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités d'Optimisation PDF/A</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✓ Détection Automatique</h4>
              <p className="text-sm text-muted-foreground">
                Identification automatique des versions PDF/A-1, PDF/A-2, et PDF/A-3
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✓ Résolution Optimisée</h4>
              <p className="text-sm text-muted-foreground">
                300 DPI pour les documents d'archivage vs 200 DPI pour les PDF standards
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✓ Métadonnées Préservées</h4>
              <p className="text-sm text-muted-foreground">
                Extraction et conservation complète des métadonnées d'archivage
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✓ Audit Trail</h4>
              <p className="text-sm text-muted-foreground">
                Traçabilité complète des documents PDF/A avec journalisation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Statistics */}
      <div className="flex justify-end">
        <Button 
          onClick={loadPDFAStatistics} 
          variant="outline"
          disabled={loading}
        >
          Actualiser les Statistiques
        </Button>
      </div>
    </div>
  );
};

export default PDFAOptimizer;