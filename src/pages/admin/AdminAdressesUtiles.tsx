import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUsefulAddresses, UsefulAddress } from "@/hooks/useUsefulAddresses";
import { useGovernorates } from "@/hooks/useGovernorates";
import { UsefulAddressForm } from "@/components/admin/UsefulAddressForm";

const AdminAdressesUtiles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UsefulAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const { addresses, isLoading, createAddress, updateAddress, deleteAddress, togglePublish } =
    useUsefulAddresses(false);
  const { governorates } = useGovernorates();

  const filteredAddresses = addresses.filter((address) => {
    const matchesSearch =
      address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.name_ar.includes(searchQuery) ||
      address.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.phone.includes(searchQuery);

    const matchesGovernorate =
      selectedGovernorate === "all" || address.governorate_id === selectedGovernorate;

    return matchesSearch && matchesGovernorate;
  });

  const handleCreate = () => {
    setSelectedAddress(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: UsefulAddress) => {
    setSelectedAddress(address);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      deleteAddress.mutate(addressToDelete);
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSubmit = (values: any) => {
    if (selectedAddress) {
      updateAddress.mutate({ id: selectedAddress.id, ...values });
    } else {
      createAddress.mutate(values);
    }
    setIsDialogOpen(false);
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    togglePublish.mutate({ id, is_published: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Adresses Utiles</h2>
          <p className="text-muted-foreground">
            Gérer les adresses et contacts des organismes
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une adresse
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Rechercher par nom, adresse ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les gouvernorats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les gouvernorats</SelectItem>
                {governorates.map((gov) => (
                  <SelectItem key={gov.id} value={gov.id}>
                    {gov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des adresses */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAddresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{address.name}</CardTitle>
                    {!address.is_published && (
                      <Badge variant="secondary">Non publié</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg text-right mb-2" dir="rtl">
                    {address.name_ar}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="outline">{address.category}</Badge>
                    {address.governorates && (
                      <Badge variant="outline" className="ml-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {address.governorates.name}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(address.id, address.is_published)}
                  >
                    {address.is_published ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Adresse:</p>
                <p className="text-sm text-muted-foreground">{address.address}</p>
                <p className="text-sm text-muted-foreground text-right" dir="rtl">
                  {address.address_ar}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{address.phone}</span>
                </div>
                {address.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{address.email}</span>
                  </div>
                )}
              </div>
              {(address.hours || address.hours_ar) && (
                <div className="text-sm">
                  <p className="font-medium">Horaires:</p>
                  {address.hours && (
                    <p className="text-muted-foreground">{address.hours}</p>
                  )}
                  {address.hours_ar && (
                    <p className="text-muted-foreground text-right" dir="rtl">
                      {address.hours_ar}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredAddresses.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune adresse trouvée
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Création/Édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAddress ? "Modifier l'adresse" : "Ajouter une adresse"}
            </DialogTitle>
          </DialogHeader>
          <UsefulAddressForm
            address={selectedAddress || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette adresse ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAdressesUtiles;
