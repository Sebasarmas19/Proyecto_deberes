import { chromium } from 'playwright';

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to http://127.0.0.1:3000 ...");
    console.log("Navigating to http://127.0.0.1:3000/setup ...");
    await page.goto('http://127.0.0.1:3000/setup');
    await page.waitForLoadState('networkidle');

    // Step 1
    console.log("Filling Step 1...");
    await page.fill('input[placeholder="Ej. Familia Armas"]', 'Familia Prueba');
    await page.fill('input[type="time"]', '22:00');
    await page.click('button:has-text("Siguiente")');

    // Step 2
    console.log("Filling Step 2...");
    await page.waitForSelector('text="IMPORTANTE"', { state: 'visible', timeout: 5000 });
    console.log("Admin warning is visible.");

    await page.fill('input[placeholder="Crea una contraseña segura"]', 'admin123');
    await page.fill('input[placeholder="Repite la contraseña"]', 'admin123');
    await page.click('button:has-text("Siguiente")');

    // Step 3
    console.log("Filling Step 3...");
    const inputs = await page.$$('input[placeholder="Nombre"]');
    await inputs[0].fill('Sebastian');
    await inputs[1].fill('Samuel');
    await page.click('button:has-text("Siguiente")');

    // Step 4
    console.log("Confirming...");
    await page.click('button:has-text("Crear hogar")');

    // Wait for redirect to admin?onboarding=true
    console.log("Waiting for navigation to admin...");
    await page.waitForURL('**/admin?onboarding=true', { timeout: 10000 });
    console.log("Successfully redirected to admin?onboarding=true");

    // Check for Toast
    console.log("Checking for toast...");
    await page.waitForSelector('text=¡Hogar creado!', { timeout: 5000 });
    console.log("Toast showed up correctly!");

    // Navigate to profile selector
    console.log("Going back to profile selector...");
    await page.click('button[aria-label="Volver al selector de perfiles"]');
    await page.waitForURL('http://127.0.0.1:3000/');

    // Click on Sebastian profile
    console.log("Clicking on Sebastian profile...");
    await page.click('button[aria-label="Entrar como Sebastian"]');
    
    // Wait for the URL to change (should be UUID now)
    await page.waitForURL(/\/([0-9a-fA-F-]{36})$/);
    console.log("Successfully routed to an ID-based URL:", page.url());

    // Wait for home screen to load
    await page.waitForSelector('text=Buenas, Sebastian');
    console.log("Home screen loaded correctly with ID slug.");

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    await page.screenshot({ path: 'qa-fail.png' });
  } finally {
    await browser.close();
  }
}

runTest();
