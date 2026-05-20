CREATE TABLE "transactions" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(50) NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	CONSTRAINT "transactions_id_unique" UNIQUE("id")
);
