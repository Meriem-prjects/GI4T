import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGovernorates } from "@/hooks/useGovernorates";
import { UsefulAddress } from "@/hooks/useUsefulAddresses";

const formSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  name_ar: z.string().min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  address_ar: z.string().min(5, "العنوان يجب أن يحتوي على 5 أحرف على الأقل"),
  phone: z.string().min(8, "Le numéro doit contenir au moins 8 chiffres"),
  category: z.string().min(1, "La catégorie est requise"),
  category_ar: z.string().min(1, "الفئة مطلوبة"),
  governorate_id: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  hours: z.string().optional(),
  hours_ar: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  is_published: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface UsefulAddressFormProps {
  address?: UsefulAddress;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export const UsefulAddressForm = ({
  address,
  onSubmit,
  onCancel,
}: UsefulAddressFormProps) => {
  const { governorates } = useGovernorates();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: address?.name || "",
      name_ar: address?.name_ar || "",
      address: address?.address || "",
      address_ar: address?.address_ar || "",
      phone: address?.phone || "",
      category: address?.category || "Chambre des Avocats",
      category_ar: address?.category_ar || "الدائرة الإبتدائية",
      governorate_id: address?.governorate_id || "",
      email: address?.email || "",
      hours: address?.hours || "",
      hours_ar: address?.hours_ar || "",
      latitude: address?.latitude?.toString() || "",
      longitude: address?.longitude?.toString() || "",
      is_published: address?.is_published ?? true,
    },
  });

  const handleSubmit = (values: FormValues) => {
    const submitData = {
      ...values,
      latitude: values.latitude ? parseFloat(values.latitude) : null,
      longitude: values.longitude ? parseFloat(values.longitude) : null,
      email: values.email || null,
      hours: values.hours || null,
      hours_ar: values.hours_ar || null,
      governorate_id: values.governorate_id || null,
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom FR */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom (Français)</FormLabel>
                <FormControl>
                  <Input placeholder="Chambre des Avocats de..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nom AR */}
          <FormField
            control={form.control}
            name="name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الاسم (عربي)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="الدائرة الإبتدائية..."
                    dir="rtl"
                    className="text-right"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Catégorie FR */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie (Français)</FormLabel>
                <FormControl>
                  <Input placeholder="Chambre des Avocats" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Catégorie AR */}
          <FormField
            control={form.control}
            name="category_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الفئة (عربي)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="الدائرة الإبتدائية"
                    dir="rtl"
                    className="text-right"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adresse FR */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse (Français)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Avenue..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Adresse AR */}
        <FormField
          control={form.control}
          name="address_ar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان (عربي)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="شارع..."
                  dir="rtl"
                  className="resize-none text-right"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Téléphone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="70 028 713" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optionnel)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gouvernorat */}
          <FormField
            control={form.control}
            name="governorate_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gouvernorat</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un gouvernorat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id}>
                        {gov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Horaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horaires (Français, optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Lun-Ven: 8h-17h" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hours_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الأوقات (عربي، اختياري)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="الإثنين-الجمعة: 8-17"
                    dir="rtl"
                    className="text-right"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Coordonnées GPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude (optionnel)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="36.8065"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude (optionnel)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="10.1815"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Publié */}
        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publier</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Rendre cette adresse visible au public
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {address ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
