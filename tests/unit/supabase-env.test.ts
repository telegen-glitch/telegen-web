import { describe, expect, it } from "vitest";
import { readClinicalEnv } from "@/clinical/env";
import { cleanDatabaseUrl, readSupabaseEnv, secretKeyHeaders, supabaseMissing } from "@/lib/supabase-env";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;
const URL_ = "https://abcd.supabase.co";

/** CLAUDE.md v5.1: both naming schemes and both key formats work; secrets never go public. */
describe("Supabase environment", () => {
  it("reads the new names and the new key format", () => {
    const s = readSupabaseEnv(
      env({
        SUPABASE_URL: URL_,
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
        SUPABASE_SECRET_KEY: "sb_secret_y",
        DATABASE_URL: "postgresql://u:p@h:6543/postgres",
      }),
    );
    expect(s).toMatchObject({
      url: URL_,
      publicKey: "sb_publishable_x",
      secretKey: "sb_secret_y",
      problems: [],
    });
  });

  it("reads the integration's and the legacy names", () => {
    const s = readSupabaseEnv(
      env({
        NEXT_PUBLIC_SUPABASE_URL: `${URL_}/`,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJ.anon",
        SUPABASE_SERVICE_ROLE_KEY: "eyJ.service",
        POSTGRES_URL:
          "postgres://u:p@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x",
      }),
    );
    expect(s.url).toBe(URL_);
    expect(s.publicKey).toBe("eyJ.anon");
    expect(s.secretKey).toBe("eyJ.service");
    expect(s.databaseUrl).toBe(
      "postgres://u:p@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require",
    );
    expect(
      supabaseMissing(
        env({
          NEXT_PUBLIC_SUPABASE_URL: URL_,
          SUPABASE_ANON_KEY: "a",
          SUPABASE_SECRET_KEY: "s",
          POSTGRES_URL: "postgres://x",
        }),
      ),
    ).toEqual([]);
  });

  it("prefers the publishable key over the anon key when both are set", () => {
    expect(
      readSupabaseEnv(env({ SUPABASE_ANON_KEY: "eyJ.anon", SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x" }))
        .publicKey,
    ).toBe("sb_publishable_x");
  });

  it("refuses a secret in a NEXT_PUBLIC_ variable or in the wrong slot", () => {
    const s = readSupabaseEnv(
      env({
        SUPABASE_URL: URL_,
        NEXT_PUBLIC_SUPABASE_SECRET_KEY: "sb_secret_y",
        SUPABASE_PUBLISHABLE_KEY: "sb_secret_y",
      }),
    );
    expect(s.secretKey).toBeNull(); // a NEXT_PUBLIC_ name is never read for the secret
    expect(s.publicKey).toBeNull();
    expect(s.problems.join(" ")).toMatch(/NEXT_PUBLIC_SUPABASE_SECRET_KEY/);
    expect(s.problems.join(" ")).not.toContain("sb_secret_y"); // names, never values
  });

  it("sends a new-format key only as apikey, a legacy key also as Bearer", () => {
    expect(secretKeyHeaders("sb_secret_y")).toEqual({ apikey: "sb_secret_y" });
    expect(secretKeyHeaders("eyJ.service")).toEqual({
      apikey: "eyJ.service",
      Authorization: "Bearer eyJ.service",
    });
  });

  it("keeps only sslmode in the connection string", () => {
    expect(cleanDatabaseUrl("postgres://u:p@h:6543/db?supa=x&sslmode=require&pgbouncer=true")).toBe(
      "postgres://u:p@h:6543/db?sslmode=require",
    );
  });

  it("the clinical service is configured only with the URL, both keys and the database", () => {
    const base = {
      SUPABASE_URL: URL_,
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
      SUPABASE_SECRET_KEY: "sb_secret_y",
    };
    expect(readClinicalEnv(env(base)).supabase).toEqual({
      url: URL_,
      publicKey: "sb_publishable_x",
      secretKey: "sb_secret_y",
    });
    expect(readClinicalEnv(env(base)).databaseUrl).toBeNull();
    expect(readClinicalEnv(env({ SUPABASE_URL: URL_ })).supabase).toBeNull();
  });
});
