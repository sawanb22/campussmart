/**
 * Verification Test Suite for Agent 6 — Shop, Product Catalog, Wishlist & Orders Remediation
 * Change ID: SHOP-001
 * 
 * Verifies:
 * 1. Multi-field product search (name, SKU, description) with case-insensitivity
 * 2. Category filtering with case-insensitive slug handling
 * 3. Inactive product public 404 gating vs admin access
 * 4. Admin ?active=all and PATCH /api/products/:id/restore reactivation
 * 5. Prisma unique conflict handling (409 Conflict on duplicate slug/SKU)
 * 6. Wishlist product validation (404 on missing, 400 on inactive, idempotent upsert)
 * 7. Wishlist CMS design cards persistence and deletion
 * 8. Order validation (qty > 0, active check, status validation)
 * 9. Order dual relation contract (both order.items and order.orderitem populated)
 */
process.env.VERCEL = '1';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../src/lib/prisma';
import productsRoutes from '../src/routes/products.routes';
import wishlistRoutes from '../src/routes/wishlist.routes';
import ordersRoutes from '../src/routes/orders.routes';

const app = express();
app.use(express.json());
app.use('/api/products', productsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
        console.log(`✅ PASS: ${testName}`);
        passedCount++;
    } else {
        console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
        failedCount++;
    }
}

async function runTests() {
    console.log('\n🚀 Starting Agent 6: Shop, Catalog, Wishlist & Orders Verification Suite...\n');

    const TEST_PORT = 3996;
    const server = app.listen(TEST_PORT);
    const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

    // Test resources tracker for cleanup
    let testUserId: number | null = null;
    let testAdminId: number | null = null;
    let testCategoryId: number | null = null;
    let testProductId: number | null = null;
    let testOrderId: number | null = null;

    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'secret';

        // 1. Setup Test Users (regular user and admin)
        const testUserEmail = `agent6_user_${Date.now()}@campusmart.test`;
        const testAdminEmail = `agent6_admin_${Date.now()}@campusmart.test`;

        const testUser = await prisma.user.create({
            data: {
                email: testUserEmail,
                name: 'Agent 6 Test User',
                passwordHash: 'HashedPassword123',
                role: 'user',
                emailVerified: true,
            },
        });
        testUserId = testUser.id;

        const testAdmin = await prisma.user.create({
            data: {
                email: testAdminEmail,
                name: 'Agent 6 Test Admin',
                passwordHash: 'HashedPassword123',
                role: 'admin',
                emailVerified: true,
            },
        });
        testAdminId = testAdmin.id;

        const userToken = jwt.sign({ id: testUser.id, email: testUser.email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
        const adminToken = jwt.sign({ id: testAdmin.id, email: testAdmin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

        const userHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` };
        const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

        // 2. Setup Test Category & Product
        const categorySlug = `test-cat-${Date.now()}`;
        const testCat = await prisma.category.create({
            data: {
                name: 'Agent 6 Test Category',
                slug: categorySlug,
                page: 'furniture',
            },
        });
        testCategoryId = testCat.id;

        const productSku = `TEST-SKU-${Date.now()}`;
        const productSlug = `test-product-${Date.now()}`;
        const testProd = await prisma.product.create({
            data: {
                name: 'Ergonomic Executive Office Chair',
                slug: productSlug,
                sku: productSku,
                description: 'High-density mesh lumbar support study chair for modern campuses',
                price: 8500,
                stock: 25,
                active: true,
                categoryId: testCat.id,
            },
        });
        testProductId = testProd.id;

        console.log(`Initialized test fixtures: User ${testUserId}, Admin ${testAdminId}, Category ${testCategoryId}, Product ${testProductId}`);

        // --- SUITE 1: Multi-field Search & Filters ---
        console.log('\n--- SUITE 1: Multi-field Search & Case-insensitivity ---');

        // Search by Name keyword
        const resSearchName = await fetch(`${BASE_URL}/api/products?search=ergonomic`);
        const dataSearchName = (await resSearchName.json()) as any;
        assert(
            resSearchName.status === 200 && dataSearchName.products.some((p: any) => p.id === testProductId),
            'Product searchable by name substring (case-insensitive)'
        );

        // Search by SKU keyword
        const resSearchSku = await fetch(`${BASE_URL}/api/products?search=${productSku.toLowerCase()}`);
        const dataSearchSku = (await resSearchSku.json()) as any;
        assert(
            resSearchSku.status === 200 && dataSearchSku.products.some((p: any) => p.id === testProductId),
            'Product searchable by SKU (case-insensitive)'
        );

        // Search by Description keyword
        const resSearchDesc = await fetch(`${BASE_URL}/api/products?search=lumbar`);
        const dataSearchDesc = (await resSearchDesc.json()) as any;
        assert(
            resSearchDesc.status === 200 && dataSearchDesc.products.some((p: any) => p.id === testProductId),
            'Product searchable by description keyword'
        );

        // Price range filter
        const resPriceFilter = await fetch(`${BASE_URL}/api/products?minPrice=8000&maxPrice=9000`);
        const dataPriceFilter = (await resPriceFilter.json()) as any;
        assert(
            resPriceFilter.status === 200 && dataPriceFilter.products.some((p: any) => p.id === testProductId),
            'Price range filter matches product between 8000 and 9000'
        );

        // In Stock filter
        const resStockFilter = await fetch(`${BASE_URL}/api/products?inStock=true`);
        const dataStockFilter = (await resStockFilter.json()) as any;
        assert(
            resStockFilter.status === 200 && dataStockFilter.products.every((p: any) => p.stock > 0),
            'inStock=true filter returns only products with stock > 0'
        );

        // --- SUITE 2: Category Slug Case-insensitivity ---
        console.log('\n--- SUITE 2: Category Slug Matching & Pagination ---');

        const resCatLower = await fetch(`${BASE_URL}/api/products?category=${categorySlug.toLowerCase()}`);
        const dataCatLower = (await resCatLower.json()) as any;
        assert(
            resCatLower.status === 200 && dataCatLower.products.some((p: any) => p.id === testProductId),
            'Category slug filter works with lowercase query'
        );

        const resCatUpper = await fetch(`${BASE_URL}/api/products?category=${categorySlug.toUpperCase()}`);
        const dataCatUpper = (await resCatUpper.json()) as any;
        assert(
            resCatUpper.status === 200 && dataCatUpper.products.some((p: any) => p.id === testProductId),
            'Category slug filter works with UPPERCASE query (case-insensitive OR match)'
        );

        // Pagination metadata contract
        const resPagination = await fetch(`${BASE_URL}/api/products?limit=10&page=1`);
        const dataPagination = (await resPagination.json()) as any;
        assert(
            typeof dataPagination.total === 'number' &&
            dataPagination.page === 1 &&
            typeof dataPagination.totalPages === 'number' &&
            Array.isArray(dataPagination.products),
            'Pagination contract returns { total, page, totalPages, products }'
        );

        // --- SUITE 3: Product Inactive Gating & Admin Reactivation ---
        console.log('\n--- SUITE 3: Inactive Product Gating & Restore ---');

        // Deactivate test product via Prisma directly (or DELETE endpoint)
        await prisma.product.update({
            where: { id: testProductId },
            data: { active: false },
        });

        // Public GET /api/products should NOT return inactive product
        const resPublicList = await fetch(`${BASE_URL}/api/products?limit=200`);
        const dataPublicList = (await resPublicList.json()) as any;
        assert(
            !dataPublicList.products.some((p: any) => p.id === testProductId),
            'Public GET /api/products excludes deactivated product'
        );

        // Public GET /api/products/:id should return 404 for inactive product
        const resPublicSingle = await fetch(`${BASE_URL}/api/products/${testProductId}`);
        assert(
            resPublicSingle.status === 404,
            'Public GET /api/products/:id returns 404 for deactivated product'
        );

        // Admin GET /api/products/:id should return 200 with product
        const resAdminSingle = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
            headers: adminHeaders,
        });
        const dataAdminSingle = (await resAdminSingle.json()) as any;
        assert(
            resAdminSingle.status === 200 && dataAdminSingle.id === testProductId && dataAdminSingle.active === false,
            'Admin GET /api/products/:id can view deactivated product'
        );

        // Admin GET /api/products?active=all should include deactivated product
        const resAdminListAll = await fetch(`${BASE_URL}/api/products?active=all&limit=250`, {
            headers: adminHeaders,
        });
        const dataAdminListAll = (await resAdminListAll.json()) as any;
        assert(
            dataAdminListAll.products.some((p: any) => p.id === testProductId && p.active === false),
            'Admin GET /api/products?active=all returns inactive products'
        );

        // Non-admin call to PATCH /api/products/:id/restore should be rejected (403)
        const resUserRestore = await fetch(`${BASE_URL}/api/products/${testProductId}/restore`, {
            method: 'PATCH',
            headers: userHeaders,
        });
        assert(
            resUserRestore.status === 403,
            'Non-admin cannot reactivate products (returns 403 Forbidden)'
        );

        // Admin call to PATCH /api/products/:id/restore reactivates product
        const resAdminRestore = await fetch(`${BASE_URL}/api/products/${testProductId}/restore`, {
            method: 'PATCH',
            headers: adminHeaders,
        });
        const dataAdminRestore = (await resAdminRestore.json()) as any;
        assert(
            resAdminRestore.status === 200 && (dataAdminRestore.product?.active === true || dataAdminRestore.active === true),
            'Admin PATCH /api/products/:id/restore successfully reactivates product'
        );

        // --- SUITE 4: Conflict Handling on Duplicate Slug/SKU ---
        console.log('\n--- SUITE 4: Duplicate Conflict Handling (409) ---');

        const resDupSku = await fetch(`${BASE_URL}/api/products`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                name: 'Duplicate SKU Product',
                sku: productSku, // already exists
                price: 1200,
                categoryId: testCategoryId,
            }),
        });
        assert(
            resDupSku.status === 409,
            'POST /api/products with duplicate SKU returns 409 Conflict'
        );

        // --- SUITE 5: Wishlist Validation & CMS Design Cards ---
        console.log('\n--- SUITE 5: Wishlist Validation & Design Cards ---');

        // Missing product rejection (404)
        const resWishMissing = await fetch(`${BASE_URL}/api/wishlist`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({ productId: 99999999 }),
        });
        assert(
            resWishMissing.status === 404,
            'POST /api/wishlist rejects non-existent product with 404'
        );

        // Deactivated product rejection (400)
        await prisma.product.update({ where: { id: testProductId }, data: { active: false } });
        const resWishInactive = await fetch(`${BASE_URL}/api/wishlist`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({ productId: testProductId }),
        });
        assert(
            resWishInactive.status === 400,
            'POST /api/wishlist rejects inactive product with 400'
        );

        // Reactivate for valid add
        await prisma.product.update({ where: { id: testProductId }, data: { active: true } });
        const resWishAdd = await fetch(`${BASE_URL}/api/wishlist`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({ productId: testProductId }),
        });
        const dataWishAdd = (await resWishAdd.json()) as any;
        assert(
            resWishAdd.status === 201 && dataWishAdd.productId === testProductId,
            'POST /api/wishlist adds active product successfully (201)'
        );

        // Idempotent add (calling again should not error or duplicate)
        const resWishAddAgain = await fetch(`${BASE_URL}/api/wishlist`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({ productId: testProductId }),
        });
        assert(
            resWishAddAgain.status === 201,
            'POST /api/wishlist duplicate add is idempotent (returns 201)'
        );

        // Add CMS Design card
        const testDesignKey = `design-${Date.now()}`;
        const resWishDesign = await fetch(`${BASE_URL}/api/wishlist`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({
                designKey: testDesignKey,
                designTitle: 'NextGen Robotics Lab Setup',
                designImage: 'https://example.com/robotics.jpg',
                pageSlug: 'labs',
            }),
        });
        assert(
            resWishDesign.status === 201,
            'POST /api/wishlist saves custom CMS space design card'
        );

        // Fetch Wishlist
        const resWishGet = await fetch(`${BASE_URL}/api/wishlist`, {
            headers: userHeaders,
        });
        const dataWishGet = (await resWishGet.json()) as any;
        assert(
            Array.isArray(dataWishGet) &&
            dataWishGet.some((item: any) => item.productId === testProductId) &&
            dataWishGet.some((item: any) => item.designKey === testDesignKey),
            'GET /api/wishlist returns both product and design card entries'
        );

        // Delete Product from Wishlist
        const resWishDelProd = await fetch(`${BASE_URL}/api/wishlist/${testProductId}`, {
            method: 'DELETE',
            headers: userHeaders,
        });
        assert(
            resWishDelProd.status === 200,
            'DELETE /api/wishlist/:productId removes product from wishlist'
        );

        // Delete Design from Wishlist
        const resWishDelDesign = await fetch(`${BASE_URL}/api/wishlist/design/${encodeURIComponent(testDesignKey)}`, {
            method: 'DELETE',
            headers: userHeaders,
        });
        assert(
            resWishDelDesign.status === 200,
            'DELETE /api/wishlist/design/:designKey removes design from wishlist'
        );

        // --- SUITE 6: Orders Validation & Dual Relation Contract ---
        console.log('\n--- SUITE 6: Orders Validation & Dual Relation Contract ---');

        // Negative/Zero Qty rejection (400)
        const resOrderZeroQty = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({
                items: [{ productId: testProductId, qty: 0 }],
            }),
        });
        assert(
            resOrderZeroQty.status === 400,
            'POST /api/orders rejects qty <= 0 with 400'
        );

        // Inactive product in order rejection (400)
        await prisma.product.update({ where: { id: testProductId }, data: { active: false } });
        const resOrderInactive = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({
                items: [{ productId: testProductId, qty: 2 }],
            }),
        });
        assert(
            resOrderInactive.status === 400,
            'POST /api/orders rejects order containing inactive product with 400'
        );

        // Reactivate product for valid order creation
        await prisma.product.update({ where: { id: testProductId }, data: { active: true } });
        const resOrderCreate = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify({
                items: [{ productId: testProductId, qty: 3 }],
                notes: 'Institutional test quotation order',
            }),
        });
        const dataOrderCreate = (await resOrderCreate.json()) as any;
        testOrderId = dataOrderCreate.id;
        assert(
            resOrderCreate.status === 201 &&
            Array.isArray(dataOrderCreate.items) &&
            Array.isArray(dataOrderCreate.orderitem) &&
            dataOrderCreate.items.length === 1 &&
            dataOrderCreate.items[0].qty === 3 &&
            dataOrderCreate.total === 3 * 8500,
            'POST /api/orders returns dual contract { items, orderitem } with correct total'
        );

        // Fetch User orders
        const resUserOrders = await fetch(`${BASE_URL}/api/orders`, {
            headers: userHeaders,
        });
        const dataUserOrders = (await resUserOrders.json()) as any;
        const foundUserOrder = dataUserOrders.find((o: any) => o.id === testOrderId);
        assert(
            foundUserOrder &&
            Array.isArray(foundUserOrder.items) &&
            Array.isArray(foundUserOrder.orderitem),
            'GET /api/orders satisfies dual contract on customer orders list'
        );

        // Fetch Admin orders
        const resAdminOrders = await fetch(`${BASE_URL}/api/orders/all`, {
            headers: adminHeaders,
        });
        const dataAdminOrders = (await resAdminOrders.json()) as any;
        const foundAdminOrder = dataAdminOrders.find((o: any) => o.id === testOrderId);
        assert(
            foundAdminOrder &&
            Array.isArray(foundAdminOrder.items) &&
            Array.isArray(foundAdminOrder.orderitem) &&
            Boolean(foundAdminOrder.user?.name),
            'GET /api/orders/all satisfies dual contract and includes user info'
        );

        // Invalid status rejection (400)
        const resInvalidStatus = await fetch(`${BASE_URL}/api/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({ status: 'fraudulent_status' }),
        });
        assert(
            resInvalidStatus.status === 400,
            'PUT /api/orders/:id/status rejects unrecognized status with 400'
        );

        // Valid status update
        const resValidStatus = await fetch(`${BASE_URL}/api/orders/${testOrderId}/status`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({ status: 'processing' }),
        });
        const dataValidStatus = (await resValidStatus.json()) as any;
        assert(
            resValidStatus.status === 200 &&
            dataValidStatus.status === 'processing' &&
            Array.isArray(dataValidStatus.items),
            'PUT /api/orders/:id/status updates status to processing and returns dual contract'
        );

        // --- SUITE 7: Category Normalization ---
        console.log('\n--- SUITE 7: Category Normalization & Conflict ---');

        const newCatSlug = `Normalized-Cat-${Date.now()}`;
        const resCatCreate = await fetch(`${BASE_URL}/api/products/categories`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                name: 'Auto Lowercase Category',
                slug: newCatSlug,
                page: 'furniture',
            }),
        });
        const dataCatCreate = (await resCatCreate.json()) as any;
        const createdCatId = dataCatCreate.id;
        assert(
            resCatCreate.status === 201 && dataCatCreate.slug === newCatSlug.toLowerCase(),
            'POST /api/products/categories normalizes slug to lowercase'
        );

        // Clean up created cat
        if (createdCatId) {
            await prisma.category.delete({ where: { id: createdCatId } });
        }

    } catch (err: any) {
        console.error('💥 Test suite execution error:', err);
        failedCount++;
    } finally {
        console.log('\n🧹 Cleaning up test artifacts...');
        if (testOrderId) {
            await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } }).catch(() => {});
            await prisma.order.delete({ where: { id: testOrderId } }).catch(() => {});
        }
        if (testUserId) {
            await prisma.wishlistItem.deleteMany({ where: { userId: testUserId } }).catch(() => {});
        }
        if (testProductId) {
            await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});
        }
        if (testCategoryId) {
            await prisma.category.delete({ where: { id: testCategoryId } }).catch(() => {});
        }
        if (testUserId) {
            await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
        }
        if (testAdminId) {
            await prisma.user.delete({ where: { id: testAdminId } }).catch(() => {});
        }

        server.close();
        await prisma.$disconnect();

        console.log('\n=============================================');
        console.log(`🏁 Agent 6 Test Suite Results: ${passedCount} PASSED, ${failedCount} FAILED`);
        console.log('=============================================\n');

        if (failedCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    }
}

runTests();
