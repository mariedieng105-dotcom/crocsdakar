import Link from "next/link";
import NewProductForm from "@/components/admin/NewProductForm";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/produits" className="cd-ad-link">
        ← Retour aux produits
      </Link>
      <h1 className="cd-ad-title mt-3 mb-7">Ajouter un produit</h1>
      <NewProductForm />
    </div>
  );
}
