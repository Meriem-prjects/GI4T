-- CreateTable
CREATE TABLE "useful_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "category_ar" TEXT,
    "icon" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "useful_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practical_resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "file_url" TEXT,
    "file_size" INTEGER,
    "file_type" TEXT,
    "category" TEXT,
    "category_ar" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "practical_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practical_guides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "content" TEXT,
    "content_ar" TEXT,
    "category" TEXT,
    "category_ar" TEXT,
    "cover_image_url" TEXT,
    "estimated_time" TEXT,
    "difficulty" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "practical_guides_pkey" PRIMARY KEY ("id")
);
