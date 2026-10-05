import { Page } from '@playwright/test';
import { expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

export async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Admin }] }, 'diner@jwt.com': { id: '5', name: 'pizza diner', email: 'diner@jwt.com', password: 'a', roles: [{ role: Role.Diner }] }, 'f@jwt.com': { id: '4', name: 'Kai Chen', email: 'f@jwt.com', password: 'a', roles: [{ role: Role.Franchisee }] } };

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
        if (await route.request().method() == 'GET') {
            await route.fulfill({ json: { dinerId: 4, orders: [{ id: 1, franchiseId: 1, storeId: 1, date: '2024-06-05T05:14:40.000Z', items: [{ id: 1, menuId: 1, description: 'Veggie', price: 0.05 }] }], page: 1 } });
            return;
        };
        const orderReq = route.request().postDataJSON();
        const orderRes = {
            order: { ...orderReq, id: 23 },
            jwt: 'eyJpYXQ',
        };
        expect(route.request().method()).toBe('POST');
        await route.fulfill({ json: orderRes });
    });

    // Get user franchises
    await page.route('*/**/api/franchise/4', async (route) => {
        if (await route.request().method() == 'DELETE') {
            await route.fulfill({ status: 200 });
            return;
        };
        const franchiseRes = [{ id: 2, name: 'test', admins: [{ id: 4, name: 'franchisee owner', email: 'f@jwt.com' }], stores: [{ id: 4, name: 'SLC', totalRevenue: 0 }] }]
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: franchiseRes });
    });

    // Create a store
    await page.route('*/**/api/franchise/*/store', async (route) => {
        const storeRes = { id: 2, name: 'SLC', totalRevenue: 0 }
        expect(route.request().method()).toBe('POST');
        await route.fulfill({ json: storeRes });
    });

    await page.goto('/');

    // Update user
    await page.route('*/**/api/user/5', async (route) => {
        const newUser = { user: { id: '5', name: 'pizza dinerx', email: 'dinerx@jwt.com', password: 'b', roles: [{ role: Role.Diner }] }, token: 'tttttt' }
        expect(route.request().method()).toBe('PUT');
        await route.fulfill({ json: newUser });
        validUsers['diner@jwt.com'].name = 'pizza dinerx';
        validUsers['diner@jwt.com'].email = 'dinerx@jwt.com';
        validUsers['diner@jwt.com'].password = 'b';
        validUsers['dinerx@jwt.com'] = validUsers['diner@jwt.com']
    });

    // Standard users
    await page.route(/\/api\/user(\?.*)?$/, async (route) => {
        const userRes = {
            users: [
                { id: '3', name: 'admin dude', email: 'd@jwt.com', roles: [{ role: Role.Admin }] },
                { id: '5', name: 'pizza diner', email: 'diner@jwt.com', roles: [{ role: Role.Diner }] },
                { id: '4', name: 'pizza franchisee', email: 'f@jwt.com', roles: [{ role: Role.Franchisee }] },
            ],
            more: false,
        };
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: userRes });
    });
}

export async function login(page: Page) {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
}

export async function mockUserPages(page: Page) {
  await page.route(/\/api\/user(\?.*)?$/, async (route) => {
    const pageNumber = new URL(route.request().url()).searchParams.get('page');
    if (pageNumber === '2') {
      await route.fulfill({ json: { users: [{ id: '7', name: 'Page Two', email: 'two@jwt.com', roles: [{ role: 'diner' }] }], more: false } });
    } else {
      await route.fulfill({ json: { users: [{ id: '6', name: 'Page One', email: 'one@jwt.com', roles: [{ role: 'diner' }] }], more: true } });
    }
  });
}

export async function mockUserFilter(page: Page) {
  await page.route(/\/api\/user(\?.*)?$/, async (route) => {
    const name = new URL(route.request().url()).searchParams.get('name');
    const admin = { id: '3', name: 'admin dude', email: 'd@jwt.com', roles: [{ role: 'admin' }] };
    const diner = { id: '5', name: 'pizza diner', email: 'diner@jwt.com', roles: [{ role: 'diner' }] };
    await route.fulfill({ json: { users: name === '*admin*' ? [admin] : [admin, diner], more: false } });
  });
}