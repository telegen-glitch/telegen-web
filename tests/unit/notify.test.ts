import { describe, expect, it } from "vitest";
import { subscribeToLaunch } from "@/app/evaluare/actions";
import { getNotifyAdapter } from "@/lib/notify";

describe("launch notification adapter", () => {
  it("is disabled by default", () => {
    expect(getNotifyAdapter({} as NodeJS.ProcessEnv).enabled).toBe(false);
  });

  it("stays disabled with a partial configuration", () => {
    expect(
      getNotifyAdapter({ NOTIFY_ADAPTER: "brevo", BREVO_API_KEY: "x" } as unknown as NodeJS.ProcessEnv)
        .enabled,
    ).toBe(false);
  });

  it("rejects missing consent and accepts only email + consent", async () => {
    const noConsent = new FormData();
    noConsent.set("email", "a@exemplu.ro");
    expect(await subscribeToLaunch(null, noConsent)).toEqual({ status: "invalid" });

    const ok = new FormData();
    ok.set("email", "a@exemplu.ro");
    ok.set("consent", "on");
    ok.set("answers", "should-be-ignored");
    expect(await subscribeToLaunch(null, ok)).toEqual({ status: "disabled" });
  });
});
