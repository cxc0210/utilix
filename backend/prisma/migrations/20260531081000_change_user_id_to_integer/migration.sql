CREATE SEQUENCE "users_id_seq"
    START WITH 1001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "users" ADD COLUMN "next_id" INTEGER;
ALTER TABLE "users" ALTER COLUMN "next_id" SET DEFAULT nextval('users_id_seq');

UPDATE "users"
SET "next_id" = nextval('users_id_seq')
WHERE "next_id" IS NULL;

ALTER TABLE "users" DROP CONSTRAINT "users_pkey";
ALTER TABLE "users" DROP COLUMN "id";
ALTER TABLE "users" RENAME COLUMN "next_id" TO "id";
ALTER TABLE "users" ALTER COLUMN "id" SET NOT NULL;

ALTER SEQUENCE "users_id_seq" OWNED BY "users"."id";

ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

SELECT setval(
  'users_id_seq',
  GREATEST((SELECT COALESCE(MAX("id"), 1000) FROM "users"), 1000),
  true
);
