import { test, expect } from 'playwright-test-coverage';
import { basicInit, login, mockUserPages } from './universalFunctions';
import { Page } from '@playwright/test';

test('list users', async ({ page }) => {
    await basicInit(page);
    await login(page);
    await page.getByRole('link', { name: 'Admin' }).click();

    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

    await expect(page.getByRole('cell', { name: 'admin dude' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'd@jwt.com' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'admin', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'pizza diner' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'diner@jwt.com' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'diner', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'pizza franchisee' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'f@jwt.com' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'franchisee', exact: true })).toBeVisible();
});


test('pagination', async ({ page }) => {
    await basicInit(page);
    await mockUserPages(page);
    await login(page);
    
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('main')).toContainText('Page One');
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('main')).toContainText('Page Two');

});