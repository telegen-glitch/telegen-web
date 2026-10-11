import "server-only";
import type { Driver } from "./types";

/**
 * Local and CI data, all marked TEST. These are not real people: real doctor
 * identities exist only in the production database, entered by an admin.
 */
export const TEST_USERS = {
  admin: { id: "00000000-0000-4000-8000-0000000000a1", email: "admin@telegen.test" },
  dermatologist: { id: "00000000-0000-4000-8000-0000000000d1", email: "medic.derm@telegen.test" },
  urologist: { id: "00000000-0000-4000-8000-0000000000d2", email: "medic.uro@telegen.test" },
  pharmacy: { id: "00000000-0000-4000-8000-0000000000f1", email: "farmacie@telegen.test" },
} as const;

export const TEST_PHARMACY_ID = "00000000-0000-4000-8000-00000000fa01";

export async function seedLocal(driver: Driver): Promise<void> {
  await driver.transaction({ claims: null, role: "service_role" }, async (q) => {
    const exists = await q.query("select 1 from clinical.profiles where id = $1", [TEST_USERS.admin.id]);
    if (exists.length) return;
    for (const u of Object.values(TEST_USERS)) {
      await q.query("insert into auth.users (id, email) values ($1, $2)", [u.id, u.email]);
    }
    await q.query("insert into clinical.profiles (id, role, email) values ($1, 'admin', $2)", [
      TEST_USERS.admin.id,
      TEST_USERS.admin.email,
    ]);
    for (const [key, specialty] of [
      ["dermatologist", "dermatologie"],
      ["urologist", "urologie"],
    ] as const) {
      const u = TEST_USERS[key];
      await q.query("insert into clinical.profiles (id, role, email) values ($1, 'doctor', $2)", [
        u.id,
        u.email,
      ]);
      await q.query(
        "insert into clinical.doctors (id, full_name, specialty, parafa_code) values ($1, $2, $3, $4)",
        [u.id, `Medic TEST (${specialty})`, specialty, "TEST-000"],
      );
    }
    await q.query("insert into clinical.pharmacies (id, name) values ($1, 'Farmacie TEST')", [
      TEST_PHARMACY_ID,
    ]);
    await q.query("insert into clinical.profiles (id, role, email) values ($1, 'pharmacy', $2)", [
      TEST_USERS.pharmacy.id,
      TEST_USERS.pharmacy.email,
    ]);
    await q.query("insert into clinical.pharmacy_members (profile_id, pharmacy_id) values ($1, $2)", [
      TEST_USERS.pharmacy.id,
      TEST_PHARMACY_ID,
    ]);
  });
}
