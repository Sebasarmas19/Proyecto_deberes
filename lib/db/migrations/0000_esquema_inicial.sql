CREATE TABLE "asignaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"deber_id" uuid NOT NULL,
	"participante_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ausencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participante_id" uuid NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date NOT NULL,
	"motivo" text,
	"aprobada_por" uuid,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "criterios_deber" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deber_id" uuid NOT NULL,
	"descripcion" text NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deberes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"tipo_asignacion" text NOT NULL,
	"es_obligatorio" boolean NOT NULL,
	"es_personal" boolean DEFAULT false NOT NULL,
	"puntos" numeric NOT NULL,
	"cadencia" text NOT NULL,
	"requiere_foto" boolean DEFAULT false NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fotos_motivacionales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"url" text NOT NULL,
	"contexto" text NOT NULL,
	"deber_id" uuid,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hogar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"zona_horaria" text DEFAULT 'America/Caracas' NOT NULL,
	"hora_cierre_dia" time DEFAULT '03:00' NOT NULL,
	"bono_ayuda" numeric DEFAULT '5' NOT NULL,
	"penalizacion_fallo" numeric DEFAULT '15' NOT NULL,
	"penalizacion_colectiva" numeric DEFAULT '10' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "logros_obtenidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participante_id" uuid NOT NULL,
	"logro_clave" text NOT NULL,
	"nivel" text,
	"fecha_obtenido" date NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "participantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"auth_user_id" uuid,
	"nombre" text NOT NULL,
	"foto_url" text,
	"es_admin" boolean DEFAULT false NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"orden_rotacion" integer,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "registro_auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"accion" text NOT NULL,
	"detalle" jsonb,
	"fecha" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "registros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"deber_id" uuid NOT NULL,
	"participante_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"estado" text NOT NULL,
	"cubierto_a" uuid,
	"confirmado" boolean DEFAULT false NOT NULL,
	"confirmado_por" uuid,
	"foto_url" text,
	"nota" text,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "titulos_mes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participante_id" uuid NOT NULL,
	"ranking" text NOT NULL,
	"mes" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transacciones_puntos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hogar_id" uuid NOT NULL,
	"participante_id" uuid NOT NULL,
	"registro_id" uuid,
	"cantidad" numeric NOT NULL,
	"tipo" text NOT NULL,
	"fecha" date NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_deber_id_deberes_id_fk" FOREIGN KEY ("deber_id") REFERENCES "public"."deberes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ausencias" ADD CONSTRAINT "ausencias_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ausencias" ADD CONSTRAINT "ausencias_aprobada_por_participantes_id_fk" FOREIGN KEY ("aprobada_por") REFERENCES "public"."participantes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criterios_deber" ADD CONSTRAINT "criterios_deber_deber_id_deberes_id_fk" FOREIGN KEY ("deber_id") REFERENCES "public"."deberes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deberes" ADD CONSTRAINT "deberes_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fotos_motivacionales" ADD CONSTRAINT "fotos_motivacionales_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fotos_motivacionales" ADD CONSTRAINT "fotos_motivacionales_deber_id_deberes_id_fk" FOREIGN KEY ("deber_id") REFERENCES "public"."deberes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logros_obtenidos" ADD CONSTRAINT "logros_obtenidos_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_admin_id_participantes_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_deber_id_deberes_id_fk" FOREIGN KEY ("deber_id") REFERENCES "public"."deberes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_cubierto_a_participantes_id_fk" FOREIGN KEY ("cubierto_a") REFERENCES "public"."participantes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_confirmado_por_participantes_id_fk" FOREIGN KEY ("confirmado_por") REFERENCES "public"."participantes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos_mes" ADD CONSTRAINT "titulos_mes_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacciones_puntos" ADD CONSTRAINT "transacciones_puntos_hogar_id_hogar_id_fk" FOREIGN KEY ("hogar_id") REFERENCES "public"."hogar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacciones_puntos" ADD CONSTRAINT "transacciones_puntos_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacciones_puntos" ADD CONSTRAINT "transacciones_puntos_registro_id_registros_id_fk" FOREIGN KEY ("registro_id") REFERENCES "public"."registros"("id") ON DELETE set null ON UPDATE no action;