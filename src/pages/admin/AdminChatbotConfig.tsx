import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, FileText, Settings, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ChatbotConfig {
  id: string;
  tone: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  system_prompt: string;
  welcome_message: string;
}

interface TrainingDocument {
  id: string;
  title: string;
  title_ar: string | null;
  content: string;
  file_url: string | null;
  file_name: string | null;
  is_active: boolean;
  category: string | null;
  created_at: string;
}

const AdminChatbotConfig = () => {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [trainingDocs, setTrainingDocs] = useState<TrainingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    loadConfig();
    loadTrainingDocuments();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        setConfig(data);
        reset(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive"
      });
    }
  };

  const loadTrainingDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_training_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTrainingDocs(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const saveConfig = async (formData: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chatbot_config')
        .update({
          tone: formData.tone,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          font_family: formData.font_family,
          system_prompt: formData.system_prompt,
          welcome_message: formData.welcome_message
        })
        .eq('id', config?.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Configuration enregistrée avec succès"
      });
      loadConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadTrainingDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingDoc(true);
    const file = files[0];

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`training/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(`training/${fileName}`);

      // Read file content
      const text = await file.text();

      // Insert document record
      const { error: insertError } = await supabase
        .from('chatbot_training_documents')
        .insert({
          title: file.name,
          content: text,
          file_url: publicUrl,
          file_name: file.name,
          is_active: true
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Document ajouté avec succès"
      });
      loadTrainingDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le document",
        variant: "destructive"
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const toggleDocumentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('chatbot_training_documents')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut mis à jour"
      });
      loadTrainingDocuments();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const { error } = await supabase
        .from('chatbot_training_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Document supprimé"
      });
      loadTrainingDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuration Chatbot & FAQ</h1>
        <p className="text-muted-foreground">Personnalisez l'assistant virtuel et gérez les documents d'apprentissage</p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="training">
            <BookOpen className="h-4 w-4 mr-2" />
            Documents d'apprentissage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <form onSubmit={handleSubmit(saveConfig)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Style & Apparence</CardTitle>
                <CardDescription>Personnalisez l'apparence du chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="primary_color"
                        {...register('primary_color')}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        {...register('primary_color')}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Couleur secondaire</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="secondary_color"
                        {...register('secondary_color')}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        {...register('secondary_color')}
                        placeholder="#10B981"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font_family">Police de caractères</Label>
                  <Select onValueChange={(value) => setValue('font_family', value)} defaultValue={config?.font_family}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                      <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personnalité & Ton</CardTitle>
                <CardDescription>Définissez le ton et le comportement de l'assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Ton de la conversation</Label>
                  <Select onValueChange={(value) => setValue('tone', value)} defaultValue={config?.tone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un ton" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professionnel">Professionnel</SelectItem>
                      <SelectItem value="amical">Amical</SelectItem>
                      <SelectItem value="formel">Formel</SelectItem>
                      <SelectItem value="decontracte">Décontracté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system_prompt">Prompt système (instructions IA)</Label>
                  <Textarea
                    id="system_prompt"
                    {...register('system_prompt')}
                    rows={6}
                    placeholder="Instructions pour l'IA..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Définissez le rôle, la personnalité et les directives de l'assistant
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_message">Message de bienvenue</Label>
                  <Textarea
                    id="welcome_message"
                    {...register('welcome_message')}
                    rows={3}
                    placeholder="Message affiché au démarrage..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer la configuration"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents d'apprentissage</CardTitle>
              <CardDescription>
                Ajoutez des documents pour enrichir les connaissances de l'assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button asChild disabled={uploadingDoc}>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingDoc ? "Upload..." : "Uploader un document"}
                    <input
                      type="file"
                      accept=".txt,.md,.json,.pdf"
                      className="hidden"
                      onChange={uploadTrainingDocument}
                      disabled={uploadingDoc}
                    />
                  </label>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Formats acceptés: TXT, MD, JSON, PDF
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.is_active ? "default" : "secondary"}>
                          {doc.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDocumentStatus(doc.id, doc.is_active)}
                          >
                            {doc.is_active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {trainingDocs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Aucun document d'apprentissage
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminChatbotConfig;
