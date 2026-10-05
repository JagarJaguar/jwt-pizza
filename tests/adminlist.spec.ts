import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './universalFunctions';
import { Page } from '@playwright/test';

export async function login(page: Page) {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
}

test('list users', async ({ page }) => {
    await basicInit(page);
    await login(page);
    await page.getByRole('link', { name: 'Admin' }).click();

    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
});