import { test, expect } from 'playwright-test-coverage';
import { basicInit, login, mockUserPages, mockUserFilter, mockUserDelete } from './universalFunctions';
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

    // Go to next page
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('main')).toContainText('Page One');
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('main')).toContainText('Page Two');

    // Next/prev disabled & prev page goes to previous page
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    await page.getByRole('button', { name: 'Prev' }).click();
    await expect(page.getByRole('main')).toContainText('Page One');
    await expect(page.getByRole('button', { name: 'Prev' })).toBeDisabled();
});

test('user filter', async ({ page }) => {
    await basicInit(page);
    await mockUserFilter(page);
    await login(page);

    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('main')).toContainText('pizza diner');
    await page.getByRole('textbox', { name: 'Name' }).fill('admin');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('main')).not.toContainText('pizza diner');
    await expect(page.getByRole('main')).toContainText('admin dude');
});

test('delete a user', async ({ page }) => {
    await basicInit(page);
    await mockUserDelete(page)
    await login(page);

    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('row', { name: 'admin dude d@jwt.com admin' }).getByRole('button')).toBeVisible();
    await expect(page.getByRole('row', { name: 'pizza diner diner@jwt.com' }).getByRole('button')).toBeVisible();
    await expect(page.getByRole('row', { name: 'pizza franchisee f@jwt.com' }).getByRole('button')).toBeVisible();
    await page.getByRole('row', { name: 'pizza franchisee f@jwt.com' }).getByRole('button').click();
    await expect(page.getByRole('row', { name: 'pizza franchisee f@jwt.com' }).getByRole('button')).not.toBeVisible();
});