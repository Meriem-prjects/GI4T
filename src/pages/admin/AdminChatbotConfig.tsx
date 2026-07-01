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
import { Trash2, FileText, Settings, BookOpen, Plus, Sparkles, Pencil, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChatbotConfig {
  id: string;
  tone: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  system_prompt: string;
  welcome_message: string;
  welcome_message_ar?: string | null;
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

// ─────────────── Bilingual Q/R parser ───────────────

interface BilingualPair {
  qFr: string;
  rFr: string;
  qAr: string;
  rAr: string;
}

/**
 * Parse the pair-based bilingual content format into structured pairs.
 * Format expected:
 *   Q (FR): question fr ?
 *   R (FR): réponse fr.
 *   Q (AR): question ar ؟
 *   R (AR): جواب عربي.
 *
 *   Q (FR): ...
 * Tolerates missing FR or AR side of a pair.
 */
function parseBilingualPairs(content: string): BilingualPair[] {
  if (!content) return [];
  // Split into blocks on blank line (one block per pair).
  const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const pairs: BilingualPair[] = [];
  for (const block of blocks) {
    const pair: BilingualPair = { qFr: "", rFr: "", qAr: "", rAr: "" };
    let current: keyof BilingualPair | null = null;
    for (const rawLine of block.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (/^Q\s*\(\s*FR\s*\)\s*:/i.test(line)) {
        current = "qFr";
        pair.qFr = line.replace(/^Q\s*\(\s*FR\s*\)\s*:\s*/i, "");
      } else if (/^R\s*\(\s*FR\s*\)\s*:/i.test(line)) {
        current = "rFr";
        pair.rFr = line.replace(/^R\s*\(\s*FR\s*\)\s*:\s*/i, "");
      } else if (/^Q\s*\(\s*AR\s*\)\s*:/i.test(line)) {
        current = "qAr";
        pair.qAr = line.replace(/^Q\s*\(\s*AR\s*\)\s*:\s*/i, "");
      } else if (/^R\s*\(\s*AR\s*\)\s*:/i.test(line)) {
        current = "rAr";
        pair.rAr = line.replace(/^R\s*\(\s*AR\s*\)\s*:\s*/i, "");
      } else if (current) {
        // continuation
        pair[current] = (pair[current] + " " + line).trim();
      }
    }
    if (pair.qFr || pair.qAr) pairs.push(pair);
  }
  return pairs;
}

function serializeBilingualPairs(pairs: BilingualPair[]): string {
  return pairs
    .map((p) => {
      const lines: string[] = [];
      if (p.qFr) lines.push(`Q (FR): ${p.qFr}`);
      if (p.rFr) lines.push(`R (FR): ${p.rFr}`);
      if (p.qAr) lines.push(`Q (AR): ${p.qAr}`);
      if (p.rAr) lines.push(`R (AR): ${p.rAr}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

const AdminChatbotConfig = () => {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [trainingDocs, setTrainingDocs] = useState<TrainingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [isFineTuning, setIsFineTuning] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TrainingDocument | null>(null);
  const [editDocTitle, setEditDocTitle] = useState("");
  const [editDocContent, setEditDocContent] = useState("");
  // Structured view of the bilingual content for the dialog. Parsed
  // from `editDocContent` on dialog open; re-serialised into
  // `editDocContent` on save.
  const [editPairs, setEditPairs] = useState<BilingualPair[]>([]);
  // Toggle between the structured (pair-cards) editor and the raw
  // text editor — kept for users who want to bulk-paste content.
  const [editorMode, setEditorMode] = useState<"structured" | "raw">("structured");
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
          welcome_message: formData.welcome_message,
          welcome_message_ar: formData.welcome_message_ar || null,
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

  const addTrainingText = async () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le titre et le contenu",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('chatbot_training_documents')
        .insert({
          title: newDocTitle,
          content: newDocContent,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Texte d'apprentissage ajouté avec succès"
      });
      
      setNewDocTitle("");
      setNewDocContent("");
      setIsDialogOpen(false);
      loadTrainingDocuments();
    } catch (error) {
      console.error('Error adding text:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le texte",
        variant: "destructive"
      });
    }
  };

  const startFineTuning = async () => {
    setIsFineTuning(true);
    try {
      const { data, error } = await supabase.functions.invoke('chatbot-fine-tuning', {
        body: { action: 'train' }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Fine-tuning lancé avec succès"
      });
    } catch (error) {
      console.error('Error starting fine-tuning:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lancer le fine-tuning",
        variant: "destructive"
      });
    } finally {
      setIsFineTuning(false);
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

  const openEditDialog = (doc: TrainingDocument) => {
    setEditingDoc(doc);
    setEditDocTitle(doc.title);
    setEditDocContent(doc.content);
    const parsed = parseBilingualPairs(doc.content);
    setEditPairs(parsed);
    // If the doc has parseable pairs, open in structured mode by default;
    // otherwise fall back to raw text mode (legacy or non-Q/R content).
    setEditorMode(parsed.length > 0 ? "structured" : "raw");
    setIsEditDialogOpen(true);
  };

  const syncPairsToContent = (pairs: BilingualPair[]) => {
    setEditPairs(pairs);
    setEditDocContent(serializeBilingualPairs(pairs));
  };

  const updatePair = (index: number, field: keyof BilingualPair, value: string) => {
    const next = editPairs.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    syncPairsToContent(next);
  };

  const addPair = () => {
    syncPairsToContent([...editPairs, { qFr: "", rFr: "", qAr: "", rAr: "" }]);
  };

  const removePair = (index: number) => {
    syncPairsToContent(editPairs.filter((_, i) => i !== index));
  };

  const updateTrainingText = async () => {
    if (!editingDoc || !editDocTitle.trim() || !editDocContent.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le titre et le contenu",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('chatbot_training_documents')
        .update({
          title: editDocTitle,
          content: editDocContent
        })
        .eq('id', editingDoc.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Texte d'apprentissage modifié avec succès"
      });
      
      setEditingDoc(null);
      setEditDocTitle("");
      setEditDocContent("");
      setIsEditDialogOpen(false);
      loadTrainingDocuments();
    } catch (error) {
      console.error('Error updating text:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le texte",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="space-y-6" dir="ltr">
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
                  <Label htmlFor="welcome_message">Message de bienvenue (Français)</Label>
                  <Textarea
                    id="welcome_message"
                    {...register('welcome_message')}
                    rows={3}
                    placeholder="Message affiché au démarrage..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_message_ar">رسالة الترحيب (بالعربية)</Label>
                  <Textarea
                    id="welcome_message_ar"
                    {...register('welcome_message_ar')}
                    rows={3}
                    dir="rtl"
                    className="font-almarai"
                    placeholder="الرسالة المعروضة عند الفتح..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Affichée automatiquement quand l'interface est en arabe.
                  </p>
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
                Ajoutez des textes pour enrichir les connaissances de l'assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 justify-between">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un texte d'apprentissage
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nouveau texte d'apprentissage</DialogTitle>
                      <DialogDescription>
                        Ajoutez un texte pour enrichir la base de connaissances de l'assistant
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="doc-title">Titre du texte</Label>
                        <Input
                          id="doc-title"
                          placeholder="Ex: Guide des droits du travail"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doc-content">Contenu</Label>
                        <Textarea
                          id="doc-content"
                          placeholder="Saisissez le contenu du texte d'apprentissage..."
                          rows={10}
                          value={newDocContent}
                          onChange={(e) => setNewDocContent(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={addTrainingText}>
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="secondary" 
                  onClick={startFineTuning}
                  disabled={isFineTuning || trainingDocs.length === 0}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isFineTuning ? "Fine-tuning en cours..." : "Lancer le fine-tuning"}
                </Button>
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
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(doc)}
                          >
                            <Pencil className="h-4 w-4" />
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

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier le texte d'apprentissage</DialogTitle>
            <DialogDescription>
              Chaque paire Q/R est éditable en français et en arabe côte à côte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label htmlFor="edit-doc-title">Titre du texte</Label>
              <Input
                id="edit-doc-title"
                placeholder="Ex: Guide des droits du travail"
                value={editDocTitle}
                onChange={(e) => setEditDocTitle(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <Label>Contenu</Label>
              <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs rounded ${editorMode === "structured" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
                  onClick={() => setEditorMode("structured")}
                >
                  <Languages className="h-3 w-3 inline mr-1" />
                  Paires bilingues
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 text-xs rounded ${editorMode === "raw" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
                  onClick={() => setEditorMode("raw")}
                >
                  Texte brut
                </button>
              </div>
            </div>

            {editorMode === "structured" ? (
              <div className="space-y-3">
                {editPairs.length === 0 && (
                  <Card className="p-4 text-sm text-muted-foreground text-center">
                    Aucune paire Q/R détectée. Ajoute la première paire ci-dessous, ou passe en mode « Texte brut » pour coller du contenu existant.
                  </Card>
                )}
                {editPairs.map((p, i) => (
                  <Card key={i} className="p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">Paire #{i + 1}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePair(i)}
                        className="h-7 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Question (Français)</Label>
                        <Input
                          value={p.qFr}
                          onChange={(e) => updatePair(i, "qFr", e.target.value)}
                          placeholder="Question en français ?"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Question (Arabe)</Label>
                        <Input
                          dir="rtl"
                          value={p.qAr}
                          onChange={(e) => updatePair(i, "qAr", e.target.value)}
                          placeholder="السؤال بالعربية ؟"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Réponse (Français)</Label>
                        <Textarea
                          rows={3}
                          value={p.rFr}
                          onChange={(e) => updatePair(i, "rFr", e.target.value)}
                          placeholder="Réponse en français."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Réponse (Arabe)</Label>
                        <Textarea
                          rows={3}
                          dir="rtl"
                          value={p.rAr}
                          onChange={(e) => updatePair(i, "rAr", e.target.value)}
                          placeholder="الجواب بالعربية."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={addPair} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Ajouter une paire Q/R bilingue
                </Button>
              </div>
            ) : (
              <Textarea
                id="edit-doc-content"
                placeholder="Format attendu — un bloc par paire :&#10;Q (FR): question fr ?&#10;R (FR): réponse fr.&#10;Q (AR): question ar ؟&#10;R (AR): جواب عربي."
                rows={16}
                value={editDocContent}
                onChange={(e) => {
                  setEditDocContent(e.target.value);
                  // Try to re-parse so switching back to structured mode reflects edits.
                  setEditPairs(parseBilingualPairs(e.target.value));
                }}
                className="font-mono text-xs"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={updateTrainingText}>
              Enregistrer les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatbotConfig;
