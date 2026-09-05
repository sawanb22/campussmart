-- Allow wishlist items to reference a CMS "design" card (from the labs/libraries/sports-infra
-- pages) instead of only a real Product row, so visitors can save a design they like even when
-- it isn't tied to a purchasable product yet.
ALTER TABLE "wishlistitem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "wishlistitem" ADD COLUMN "designKey" TEXT;
ALTER TABLE "wishlistitem" ADD COLUMN "designTitle" TEXT;
ALTER TABLE "wishlistitem" ADD COLUMN "designImage" TEXT;
ALTER TABLE "wishlistitem" ADD COLUMN "pageSlug" TEXT;

CREATE UNIQUE INDEX "WishlistItem_userId_designKey_key" ON "wishlistitem"("userId", "designKey");

ALTER TABLE "wishlistitem" ADD CONSTRAINT "WishlistItem_product_or_design_check"
  CHECK (("productId" IS NOT NULL) <> ("designKey" IS NOT NULL));
