-- Les seules photos disponibles pour « Pins Crocs » sont des captures d'écran
-- du fournisseur, inutilisables sur une boutique en ligne. Le produit est donc
-- masqué de l'affichage public, sans être supprimé : il reste en base, visible
-- et modifiable dans l'administration, et un clic sur « Masqué » dans la liste
-- des produits le réaffiche dès que de vraies photos seront disponibles.
--
-- Cette migration ne s'exécute qu'une fois : une réactivation faite plus tard
-- depuis l'administration ne sera pas annulée par un déploiement suivant.
UPDATE "Product"
SET "available" = false,
    "category" = 'ACCESSOIRES'
WHERE "slug" = 'pins-crocs';
