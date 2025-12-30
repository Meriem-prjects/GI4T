import { useState } from "react";
import { News, NewsFormData } from "@/types/news";
import { useNewsAdmin, useNewsMutations } from "@/hooks/useNews";
import NewsForm from "./NewsForm";
import NewsList from "./NewsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NewsEditor = () => {
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { news, isLoading } = useNewsAdmin();
  const { createNews, updateNews, deleteNews } = useNewsMutations();

  const handleSubmit = async (data: NewsFormData) => {
    if (editingNews) {
      await updateNews.mutateAsync({ id: editingNews.id, data });
    } else {
      await createNews.mutateAsync(data);
    }
    handleCancel();
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    await deleteNews.mutateAsync(id);
  };

  const handleCancel = () => {
    setEditingNews(null);
    setIsCreating(false);
  };

  const handleNew = () => {
    setEditingNews(null);
    setIsCreating(true);
  };

  const showForm = isCreating || editingNews;

  return (
    <div className="space-y-6">
      {showForm && (
        <Button variant="ghost" onClick={handleCancel} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      )}

      {showForm ? (
        <NewsForm
          initialData={editingNews || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createNews.isPending || updateNews.isPending}
        />
      ) : (
        <NewsList
          news={news}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNew={handleNew}
        />
      )}
    </div>
  );
};

export default NewsEditor;
