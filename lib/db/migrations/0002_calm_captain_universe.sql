ALTER TABLE "deberes" ADD COLUMN "asignado_a" uuid;--> statement-breakpoint
ALTER TABLE "deberes" ADD COLUMN "limite_por_persona" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hogar" ADD COLUMN "clave_admin" text NOT NULL;--> statement-breakpoint
ALTER TABLE "deberes" ADD CONSTRAINT "deberes_asignado_a_participantes_id_fk" FOREIGN KEY ("asignado_a") REFERENCES "public"."participantes"("id") ON DELETE set null ON UPDATE no action;