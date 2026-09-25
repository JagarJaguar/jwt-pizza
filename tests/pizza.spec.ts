import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Admin }] } };

    // Authorize login for the given user
    await page.route('*/**/api/auth', async (route) => {
        if (await route.request().method() == 'DELETE') {
            await route.fulfill({ status: 200 });
            return;
        };
        const loginReq = route.request().postDataJSON();
        const user = validUsers[loginReq.email];
        if (!user || user.password !== loginReq.password) {
            await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
            return;
        }
        loggedInUser = validUsers[loginReq.email];
        const loginRes = {
            user: loggedInUser,
            token: 'abcdef',
        };
        expect(route.request().method()).toBe('PUT');
        await route.fulfill({ json: loginRes });
    });

    // Return the currently logged in user
    await page.route('*/**/api/user/me', async (route) => {
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: loggedInUser });
    });

    // A standard menu
    await page.route('*/**/api/order/menu', async (route) => {
        const menuRes = [
            {
                id: 1,
                title: 'Veggie',
                image: 'pizza1.png',
                price: 0.0038,
                description: 'A garden of delight',
            },
            {
                id: 2,
                title: 'Pepperoni',
                image: 'pizza2.png',
                price: 0.0042,
                description: 'Spicy treat',
            },
        ];
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: menuRes });
    });

    // Standard franchises and stores
    await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
        const franchiseRes = {
            franchises: [
                {
                    id: 2,
                    name: 'LotaPizza',
                    stores: [
                        { id: 4, name: 'Lehi' },
                        { id: 5, name: 'Springville' },
                        { id: 6, name: 'American Fork' },
                    ],
                },
                { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
                { id: 4, name: 'topSpot', stores: [] },
            ],
        };
        if (await route.request().method() == 'POST') {
            await route.fulfill({ status: 200, json: { id: 4, name: 'Lehi' } });
            return;
        };
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
    });

    // Order a pizza.
    await page.route('*/**/api/order', async (route) => {
        const orderReq = route.request().postDataJSON();
        const orderRes = {
            order: { ...orderReq, id: 23 },
            jwt: 'eyJpYXQ',
        };
        expect(route.request().method()).toBe('POST');
        await route.fulfill({ json: orderRes });
    });

    await page.goto('/');
}

async function login(page: Page) {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
}

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