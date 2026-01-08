import { test, expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

const demoEmail = "trainer@demo.com";
const demoPassword = "Demo1234!";
const apiBaseUrl = "http://localhost:4000";

async function loginAndGetToken(request: APIRequestContext) {
  const response = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email: demoEmail, password: demoPassword }
  });
  const data = await response.json();
  return data.accessToken as string;
}

async function createClient(
  request: APIRequestContext,
  token: string,
  suffix: string
) {
  const response = await request.post(`${apiBaseUrl}/clients`, {
    data: {
      email: `client_${suffix}@demo.com`,
      tempPassword: "Temp1234!",
      firstName: "Test",
      lastName: "Client"
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok()) {
    throw new Error(`Failed to create client: ${response.status()}`);
  }
}

test("trainer can login and view clients", async ({ page }) => {
  const token = await loginAndGetToken(page.request);
  await createClient(page.request, token, String(Date.now()));

  await page.goto("/login");

  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Hasło").fill(demoPassword);
  await page.getByRole("button", { name: "Zaloguj" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Panel trenera")).toBeVisible();

  await page.getByRole("link", { name: "Klienci" }).click();
  await expect(page).toHaveURL(/\/clients/);

  const firstClient = page.getByTestId("client-card").first();
  await expect(firstClient).toBeVisible();
  await firstClient.click();

  await expect(page.getByTestId("client-details")).toBeVisible();
});

test("trainer can add plan and check-in", async ({ page }) => {
  const token = await loginAndGetToken(page.request);
  await createClient(page.request, token, String(Date.now() + 1));

  await page.goto("/login");

  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Hasło").fill(demoPassword);
  await page.getByRole("button", { name: "Zaloguj" }).click();

  await page.getByRole("link", { name: "Klienci" }).click();
  const firstClient = page.getByTestId("client-card").first();
  await firstClient.click();

  await page.getByRole("button", { name: "+ Dodaj plan", exact: true }).click();
  await page.getByLabel("Tytuł").fill("Plan testowy");
  await page.getByLabel("Notatki").fill("Uwagi");
  await page.getByRole("button", { name: "Dodaj plan", exact: true }).click();
  await expect(page.getByText("Plan testowy")).toBeVisible();

  await page.getByRole("button", { name: "+ Dodaj check-in", exact: true }).click();
  await page.getByLabel("Data").fill("2025-01-05");
  await page.getByLabel("Waga (kg)").fill("82.4");
  await page.getByLabel("Talia (cm)").fill("84");
  await page.getByRole("button", { name: "Dodaj check-in", exact: true }).click();
  await expect(page.getByText("2025")).toBeVisible();
});
