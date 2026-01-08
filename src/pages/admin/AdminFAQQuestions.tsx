import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useFAQItems, useDeleteFAQItem, useUpdateFAQItem, useCreateFAQItem, FAQItem } from "@/hooks/useFAQItems";
import { FAQItemForm } from "@/components/admin/FAQItemForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const AdminFAQQuestions = () => {
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [showFAQForm, setShowFAQForm] = useState(false);
  
  const { data: faqItems, isLoading: loadingFAQ } = useFAQItems(false);
  const createFAQ = useCreateFAQItem();
  const updateFAQ = useUpdateFAQItem();
  const deleteFAQ = useDeleteFAQItem();

  const handleFAQSubmit = (data: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingFAQ) {
      updateFAQ.mutate({ id: editingFAQ.id, ...data });
    } else {
      createFAQ.mutate(data);
    }
    setShowFAQForm(false);
    setEditingFAQ(null);
  };

  const handleEditFAQ = (item: FAQItem) => {
    setEditingFAQ(item);
    setShowFAQForm(true);
  };

  const handleCancelFAQ = () => {
    setShowFAQForm(false);
    setEditingFAQ(null);
  };

  // Group FAQ items by category
  const groupedFAQs = faqItems?.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <div className="p-6 space-y-6" dir="ltr">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Questions FAQ</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les questions fréquentes affichées dans la section publique
          </p>
        </div>
        <Button onClick={() => setShowFAQForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle question
        </Button>
      </div>

      {showFAQForm && (
        <FAQItemForm
          item={editingFAQ || undefined}
          onSubmit={handleFAQSubmit}
          onCancel={handleCancelFAQ}
        />
      )}

      {loadingFAQ ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedFAQs && Object.entries(groupedFAQs).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <Badge variant="secondary">{items.length} question(s)</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.question}</h4>
                          {!item.is_active && <Badge variant="outline">Inactive</Badge>}
                        </div>
                        {item.question_ar && (
                          <p className="text-sm text-muted-foreground" dir="rtl">{item.question_ar}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                        {item.answer_ar && (
                          <p className="text-sm text-muted-foreground" dir="rtl">{item.answer_ar}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Ordre: {item.display_order}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditFAQ(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteFAQ.mutate(item.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          {(!groupedFAQs || Object.keys(groupedFAQs).length === 0) && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Aucune question FAQ</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFAQQuestions;
