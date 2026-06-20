CREATE TABLE "plan_semanal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"deber_id" uuid NOT NULL,
	"participante_id" uuid NOT NULL,
	"dia_semana" integer NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "plan_semanal" ADD CONSTRAINT "plan_semanal_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_semanal" ADD CONSTRAINT "plan_semanal_deber_id_deberes_id_fk" FOREIGN KEY ("deber_id") REFERENCES "public"."deberes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_semanal" ADD CONSTRAINT "plan_semanal_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;