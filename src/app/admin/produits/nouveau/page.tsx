import NewProductForm from "@/components/admin/NewProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-[var(--color-navy)] mb-6">Ajouter un produit</h1>
      <NewProductForm />
    </div>
  );
}
