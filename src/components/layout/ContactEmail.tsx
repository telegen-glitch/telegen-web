import { Missing } from "@/components/ui/Missing";
import { launchConfig } from "@/lib/launch-config";

/** The public contact address from launch-config, or an owner-only marker on previews. */
export function ContactEmail() {
  const { email } = launchConfig.contact;
  return email ? <a href={`mailto:${email}`}>{email}</a> : <Missing what="adresa de e-mail de contact" />;
}
