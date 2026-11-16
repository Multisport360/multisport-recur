/**
 * Types for the tables in supabase/migrations.
 *
 * Written by hand to match the migrations. Once the Supabase CLI is linked to the
 * project this file can be regenerated with:
 *   npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 */

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type SourceRow = { id: string; name: string; url: string };

export type BenchmarkDbRow = {
  id: number;
  sport: string;
  position_or_event: string;
  gender: string;
  metric: string;
  unit: string;
  better: string;
  level: string;
  level_code: string;
  entry: number;
  mid: number | null;
  elite: number | null;
  confidence: string;
  notes: string;
  source_id: string;
};

export type FamilyRow = { id: string; created_at: string };

export type GuardianRow = { id: string; family_id: string; user_id: string; created_at: string };

export type ConsentRow = {
  id: string;
  family_id: string;
  guardian_id: string;
  athlete_id: string | null;
  consent_version: string;
  method: string;
  accepted_at: string;
};

export type AthleteRow = {
  id: string;
  family_id: string;
  first_name: string;
  grad_year: number;
  birth_year: number;
  height_in: number | null;
  weight_lb: number | null;
  gender: string;
  login_user_id: string | null;
  created_at: string;
};

export type AthleteSportRow = {
  id: string;
  athlete_id: string;
  sport: string;
  position_or_event: string;
  created_at: string;
};

export type StatEntryRow = {
  id: string;
  athlete_id: string;
  sport: string;
  metric: string;
  value: number;
  unit: string;
  measured_on: string;
  how_measured: string;
  created_by: string | null;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  family_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: string;
  price_cents: number | null;
  billing_interval: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  renewal_reminder_sent_for: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanTemplateRow = {
  id: string;
  sport: string;
  position_or_event: string | null;
  metric: string | null;
  min_grade: number;
  max_grade: number;
  title: string;
  summary: string;
  body: unknown;
  safety_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  is_published: boolean;
  created_at: string;
};

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Database = {
  public: {
    Tables: {
      sources: Table<SourceRow, SourceRow>;
      benchmarks: Table<BenchmarkDbRow, WithOptional<Omit<BenchmarkDbRow, "id">, "mid" | "elite" | "notes">>;
      families: Table<FamilyRow, Partial<FamilyRow>>;
      guardians: Table<GuardianRow, WithOptional<GuardianRow, "id" | "created_at">>;
      consents: Table<ConsentRow, WithOptional<ConsentRow, "id" | "athlete_id" | "accepted_at">>;
      athletes: Table<
        AthleteRow,
        WithOptional<AthleteRow, "id" | "height_in" | "weight_lb" | "login_user_id" | "created_at">
      >;
      athlete_sports: Table<AthleteSportRow, WithOptional<AthleteSportRow, "id" | "created_at">>;
      stat_entries: Table<StatEntryRow, WithOptional<StatEntryRow, "id" | "created_by" | "created_at">>;
      subscriptions: Table<
        SubscriptionRow,
        WithOptional<
          SubscriptionRow,
          | "id"
          | "stripe_subscription_id"
          | "price_cents"
          | "billing_interval"
          | "current_period_end"
          | "cancel_at_period_end"
          | "canceled_at"
          | "renewal_reminder_sent_for"
          | "created_at"
          | "updated_at"
        >
      >;
      plan_templates: Table<
        PlanTemplateRow,
        WithOptional<
          PlanTemplateRow,
          | "id"
          | "position_or_event"
          | "metric"
          | "min_grade"
          | "max_grade"
          | "summary"
          | "body"
          | "reviewed_by"
          | "reviewed_at"
          | "is_published"
          | "created_at"
        >
      >;
    };
    Views: Record<never, never>;
    Functions: {
      ensure_family: { Args: Record<never, never>; Returns: string };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
