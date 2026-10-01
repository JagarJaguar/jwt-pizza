import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { basicInit, login } from './universalFunctions';


test('login', async ({ page }) => {
    await basicInit(page);
    await login(page);
    await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
    await basicInit(page);

    // Go to order page
    await page.getByRole('button', { name: 'Order now' }).click();

    // Create order
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();

    // Login
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    // Pay
    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();

    // Check balance
    await expect(page.getByText('0.008')).toBeVisible();

    // Go to Diner Dashboard
    await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
    await page.getByRole('link', { name: 'KC' }).click();
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
});

test('go to admin dashboard', async ({ page }) => {
    await basicInit(page);
    await login(page);
    // Admin Dashboard
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await page.getByRole('link', { name: 'Admin' }).click();
});

test('create franchise', async ({ page }) => {
    await basicInit(page);
    await login(page);
    // Create Franchise
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await expect(page.getByText('Create franchise', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'franchise name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'franchisee admin email' })).toBeVisible();
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('test');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('a@jwt.com');
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await page.getByRole('button', { name: 'Create' }).click();
});

test('close franchise', async ({ page }) => {
    await basicInit(page);
    await login(page);
    // Close Franchise
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.locator('tbody:nth-child(4) > .border-neutral-500 > .px-6 > .px-2')).toBeVisible();
    await page.locator('tbody:nth-child(4) > .border-neutral-500 > .px-6 > .px-2').click();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByText('Sorry to see you go')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
});

test('check about and history pages and 404', async ({ page }) => {
    await basicInit(page);
    // Go to About and History pages
    await expect(page.getByRole('contentinfo')).toContainText('About');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('main')).toContainText('The secret sauce');
    await expect(page.getByRole('contentinfo')).toContainText('History');
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
    await page.goto('/fake');
});

test('login with wrong password', async ({ page }) => {
    await basicInit(page);
    // Login using wrong password
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('main')).toContainText('{"code":401}');
});

test('logout', async ({ page }) => {
    await basicInit(page);
    await login(page);
    // Logout
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
    await page.getByRole('link', { name: 'Logout' }).click();
});

test('get user franchises', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
    // Go to franchise page
    await page.goto('/franchise-dashboard');
    await expect(page.getByText('test')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
    // Close Store Page
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
});

test('create store', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
    // Create store
    await page.goto('/franchise-dashboard');
    await page.getByRole('button', { name: 'Create store' }).click();
    await expect(page.getByText('Create store')).toBeVisible();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('test123');
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await page.getByRole('button', { name: 'Create' }).click();
});