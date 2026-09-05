ALTER TABLE "category" ADD COLUMN "page" TEXT NOT NULL DEFAULT 'furniture';

UPDATE "category"
SET "page" = CASE
  WHEN "slug" IN ('labs', 'lab-products') THEN 'labs'
  WHEN "slug" IN ('library', 'library-products') THEN 'libraries'
  WHEN "slug" IN ('sports', 'sports-products') THEN 'sports'
  ELSE 'furniture'
END;

CREATE INDEX "Category_page_idx" ON "category"("page");
