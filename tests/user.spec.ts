import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './universalFunctions';
import { Page } from '@playwright/test';

export async function login(page: Page) {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('diner@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
}

test('updateUser', async ({ page }) => {
    await basicInit(page);
    await login(page);

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText('pizza diner');

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().fill('pizza dinerx');
    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill('dinerx@jwt.com');
    await page.locator('#password').click();
    await page.locator('#password').fill('b');
    await page.getByRole('button', { name: 'Update' }).click();

    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

    await expect(page.getByRole('main')).toContainText('pizza dinerx');

    await page.getByRole('link', { name: 'Logout' }).click();
    
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('dinerx@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('b');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'pd' }).click();

    await expect(page.getByRole('main')).toContainText('pizza dinerx');
});