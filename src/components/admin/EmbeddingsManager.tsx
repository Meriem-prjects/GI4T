import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const EmbeddingsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [errors, setErrors] = useState(0);

  // Récupérer les statistiques des embeddings
  const { data: stats, isLoading } = useQuery({
    queryKey: ["embeddings-stats"],
    queryFn: async () => {
      // Total de documents publiés
      const { count: totalDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("published", true);

      // Documents avec embeddings
      const { count: withEmbeddings } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("published", true)
        .not("embedding", "is", null);

      return {
        total: totalDocs || 0,
        withEmbeddings: withEmbeddings || 0,
        withoutEmbeddings: (totalDocs || 0) - (withEmbeddings || 0),
        percentage: totalDocs ? Math.round(((withEmbeddings || 0) / totalDocs) * 100) : 0,
      };
    },
    refetchInterval: isGenerating ? 3000 : false, // Rafraîchir toutes les 3s pendant la génération
  });

  // Mutation pour générer les embeddings
  const generateEmbeddings = useMutation({
    mutationFn: async () => {
      const batchSize = 10;
      let startFrom = 0;
      let remaining = stats?.withoutEmbeddings || 0;

      while (remaining > 0) {
        const { data, error } = await supabase.functions.invoke("batch-generate-embeddings", {
          body: { batchSize, startFrom },
        });

        if (error) throw error;

        setProcessed((prev) => prev + (data.processed || 0));
        setErrors((prev) => prev + (data.errors || 0));
        
        remaining = data.remaining || 0;
        startFrom += batchSize;

        // Calculer le pourcentage de progression
        const totalToProcess = stats?.withoutEmbeddings || 0;
        const currentProgress = Math.round(((totalToProcess - remaining) / totalToProcess) * 100);
        setProgress(currentProgress);

        // Attendre un peu avant le prochain batch pour éviter les rate limits
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "✅ Génération terminée",
        description: `${processed} embeddings générés avec succès${errors > 0 ? `, ${errors} erreurs` : ""}`,
      });
      queryClient.invalidateQueries({ queryKey: ["embeddings-stats"] });
      setIsGenerating(false);
      setProgress(100);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateEmbeddings = () => {
    if (!stats?.withoutEmbeddings) {
      toast({
        title: "ℹ️ Aucun document à traiter",
        description: "Tous les documents ont déjà des embeddings",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProcessed(0);
    setErrors(0);
    generateEmbeddings.mutate();
  };

  const getStatusColor = () => {
    if (!stats) return "bg-muted";
    if (stats.percentage === 100) return "bg-green-500";
    if (stats.percentage > 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = () => {
    if (!stats) return null;
    if (stats.percentage === 100) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (stats.percentage > 0) return <RefreshCw className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Génération des Embeddings IA
            </CardTitle>
            <CardDescription>
              Générer les vecteurs sémantiques pour activer la recherche intelligente IA
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateEmbeddings}
            disabled={isGenerating || isLoading || stats?.withoutEmbeddings === 0}
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Génération en cours..." : "Générer les embeddings"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Documents publiés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avec embeddings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.withEmbeddings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sans embeddings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.withoutEmbeddings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Taux de complétion</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <div className="text-3xl font-bold">{stats?.percentage || 0}%</div>
              {getStatusIcon()}
            </CardContent>
          </Card>
        </div>

        {/* Barre de statut globale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Statut de l'indexation IA</span>
            <Badge variant={stats?.percentage === 100 ? "default" : "secondary"}>
              {stats?.percentage === 100 ? "✅ Complet" : "⚠️ Incomplet"}
            </Badge>
          </div>
          <Progress value={stats?.percentage || 0} className="h-2" />
        </div>

        {/* Barre de progression lors de la génération */}
        {isGenerating && (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Génération en cours...</span>
              <span className="text-muted-foreground">
                {processed} traités • {errors} erreurs
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Progression : {progress}% • Ne fermez pas cette page
            </p>
          </div>
        )}

        {/* Informations */}
        <div className="rounded-lg border p-4 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Comment ça fonctionne ?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Chaque document est analysé par l'IA pour créer un vecteur sémantique (embedding)</li>
            <li>Ces vecteurs permettent la recherche contextuelle et intelligente</li>
            <li>La génération prend environ 2-3 secondes par document</li>
            <li>Les nouveaux documents publiés génèrent automatiquement leurs embeddings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
