import "dotenv/config";
import { CelescClient } from "./services/celesc-client.js";

async function main(): Promise<void> {
  const client = new CelescClient();

  if (!client.sessionStore.isAuthenticated()) {
    await client.signInFromEnv();
  }

  if (!client.sessionStore.isAuthenticated()) {
    console.info(
      "Auth: set CELESC_USERNAME, CELESC_PASSWORD, CELESC_LOGIN_COOKIE (see README), or CELESC_ACCESS_TOKEN.",
    );
    return;
  }

  const navbars = await client.getNavbars("WEB");
  console.log(JSON.stringify(navbars, null, 2));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
