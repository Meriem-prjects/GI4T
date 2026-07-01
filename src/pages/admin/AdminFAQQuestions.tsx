import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Search, HelpCircle, X } from "lucide-react";
import { useFAQItems, useDeleteFAQItem, useUpdateFAQItem, useCreateFAQItem, FAQItem } from "@/hooks/useFAQItems";
import { FAQItemForm } from "@/components/admin/FAQItemForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Déterministe : la même catégorie a toujours la même couleur.
const TAG_PALETTE = [
  "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
  "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200",
  "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
  "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
  "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200",
  "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
  "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200",
];
function tagColor(category: string): string {
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) >>> 0;
  return TAG_PALETTE[h % TAG_PALETTE.length];
}

const AdminFAQQuestions = () => {
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: faqItems, isLoading: loadingFAQ } = useFAQItems(false);
  const createFAQ = useCreateFAQItem();
  const updateFAQ = useUpdateFAQItem();
  const deleteFAQ = useDeleteFAQItem();

  const handleFAQSubmit = (data: Omit<FAQItem, "id" | "created_at" | "updated_at">) => {
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

  // Counts per category for the chip row.
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of faqItems ?? []) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [faqItems]);

  const filteredItems = useMemo(() => {
    if (!faqItems) return [];
    const q = searchQuery.toLowerCase();
    return faqItems.filter((item) => {
      if (activeCategory && item.category !== activeCategory) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.question_ar?.includes(searchQuery) ?? false) ||
        (item.answer_ar?.includes(searchQuery) ?? false)
      );
    });
  }, [faqItems, activeCategory, searchQuery]);

  return (
    <div className="p-6 space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Questions FAQ</h2>
          <p className="text-sm text-muted-foreground">
            {faqItems
              ? `${faqItems.length} question${faqItems.length > 1 ? "s" : ""} dans ${categoryStats.length} catégorie${categoryStats.length > 1 ? "s" : ""}`
              : "Gérez les questions fréquentes affichées dans la section publique"}
          </p>
        </div>
        <Button onClick={() => { setEditingFAQ(null); setShowFAQForm(true); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une question
        </Button>
      </div>

      {/* Form (create/edit) */}
      {showFAQForm && (
        <FAQItemForm
          item={editingFAQ || undefined}
          onSubmit={handleFAQSubmit}
          onCancel={() => { setShowFAQForm(false); setEditingFAQ(null); }}
        />
      )}

      {/* Filter chips by category */}
      {!loadingFAQ && categoryStats.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtrer par catégorie</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === null
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/50 text-foreground border-border hover:bg-muted"
              }`}
            >
              Toutes ({faqItems?.length ?? 0})
            </button>
            {categoryStats.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : `${tagColor(cat)}`
                }`}
              >
                {cat} <span className="opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans les questions et réponses (FR + AR)…"
          className="pl-10 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Active filter indicator */}
      {(activeCategory || searchQuery) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filteredItems.length} résultat{filteredItems.length > 1 ? "s" : ""}</span>
          {activeCategory && (
            <Badge variant="outline" className="gap-1">
              {activeCategory}
              <button onClick={() => setActiveCategory(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Question list */}
      {loadingFAQ ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Chargement…</p>
          </CardContent>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery || activeCategory ? "Aucune question ne correspond à vos critères." : "Aucune question FAQ"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Top row: category tag + status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveCategory(item.category)}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${tagColor(item.category)} transition-colors`}
                      >
                        {item.category}
                      </button>
                      {!item.is_active && (
                        <Badge variant="outline" className="text-[11px]">
                          Inactive
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        Ordre : {item.display_order}
                      </span>
                    </div>
                    {/* Question */}
                    <h4 className="font-semibold leading-snug">{item.question}</h4>
                    {item.question_ar && (
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {item.question_ar}
                      </p>
                    )}
                    {/* Answer preview (truncated) */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.answer}</p>
                    {item.answer_ar && (
                      <p className="text-sm text-muted-foreground line-clamp-2" dir="rtl">
                        {item.answer_ar}
                      </p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditFAQ(item)}
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Supprimer">
                          <Trash2 className="h-4 w-4 text-destructive" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFAQQuestions;
