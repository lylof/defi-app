import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant qu'admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display users list', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('h1')).toContainText('Gestion des utilisateurs');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tr')).toHaveCount(2); // Header + 1 user
  });

  test('should update user role', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Ouvrir le menu de sélection du rôle
    await page.click('select[name="role"]');
    await page.selectOption('select[name="role"]', 'ADMIN');
    
    // Vérifier le message de succès
    await expect(page.locator('div[role="status"]')).toContainText('Utilisateur mis à jour avec succès');
  });

  test('should ban user', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Cliquer sur le bouton de suspension
    await page.click('button:has-text("Suspendre")');
    
    // Vérifier le changement de statut
    await expect(page.locator('span:has-text("Suspendu")')).toBeVisible();
    await expect(page.locator('div[role="status"]')).toContainText('Utilisateur mis à jour avec succès');
  });

  test('should display activity logs', async ({ page }) => {
    await page.goto('/admin/logs');
    await expect(page.locator('h1')).toContainText('Logs d\'activité');
    await expect(page.locator('table')).toBeVisible();
    
    // Vérifier les colonnes
    await expect(page.locator('th')).toHaveCount(4); // Date, Admin, Action, Détails
    
    // Vérifier la présence d'au moins un log
    await expect(page.locator('tr')).toHaveCount.greaterThan(1);
  });

  test('should load more logs on scroll', async ({ page }) => {
    await page.goto('/admin/logs');
    
    // Compter le nombre initial de logs
    const initialCount = await page.locator('tr').count();
    
    // Cliquer sur "Charger plus"
    await page.click('button:has-text("Charger plus")');
    
    // Vérifier que de nouveaux logs ont été chargés
    await expect(page.locator('tr')).toHaveCount.greaterThan(initialCount);
  });
}); 