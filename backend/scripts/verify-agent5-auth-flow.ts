/**
 * Verification Test Suite for Agent 5 — Authentication & User Flow Remediation
 * Tests all 8 scope items and validates fixes for:
 * 1. Half-registered lockout bug (Discovery 2)
 * 2. Login verification bypass prevention (Discovery 3)
 * 3. Case-insensitive OTP verification
 * 4. Protected route gates on emailVerified
 * 5. Password reset flow with OTP
 * 6. Admin parity and session integrity
 */
process.env.VERCEL = '1';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';
import authRoutes from '../src/routes/auth.routes';
import { verifyToken, AuthRequest } from '../src/middleware/auth.middleware';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Protected test endpoint using verifyToken
app.get('/api/test-protected', verifyToken, (req: AuthRequest, res) => {
    res.json({ success: true, user: req.user });
});

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
    console.log('\n🚀 Starting Agent 5: Authentication & User Flow Verification Suite...\n');

    const TEST_PORT = 3995;
    const server = app.listen(TEST_PORT);
    const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

    const timestamp = Date.now();
    const testEmail = `agent5_test_${timestamp}@example.com`;
    const initialPassword = 'InitialPass@123';
    const updatedPassword = 'UpdatedPass@456';
    const resetPassword = 'FinalResetPass@789';
    let verifiedEmail = '';

    try {
        // ─── TEST 1: New User Registration Flow ───
        console.log('--- Test 1: New User Registration Flow ---');
        const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Agent5 Tester',
                email: testEmail,
                password: initialPassword,
                phone: '+91 9876543210',
                institution: 'Test College',
                pincode: '500001',
            }),
        });
        const regData: any = await regRes.json();

        assert(regRes.status === 201, 'Registration returns 201 Created');
        assert(regData.user?.emailVerified === false, 'New user emailVerified is false');
        assert(!regData.accessToken, 'Unverified user does not receive active access token');

        const dbUser = await prisma.user.findFirst({
            where: { email: { equals: testEmail, mode: 'insensitive' } },
        });
        assert(Boolean(dbUser), 'User record persisted in database');
        assert(dbUser?.emailVerified === false, 'Database record has emailVerified === false');

        // ─── TEST 2: Login Screen Skips Verification Fix (Discovery 3) ───
        console.log('\n--- Test 2: Login Gating on emailVerified (Discovery 3 Fix) ---');
        const loginUnverifiedRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: initialPassword }),
        });
        const loginUnverifiedData: any = await loginUnverifiedRes.json();

        assert(loginUnverifiedRes.status === 403, 'Login with unverified user returns 403 Forbidden');
        assert(loginUnverifiedData.code === 'EMAIL_NOT_VERIFIED', 'Error code is EMAIL_NOT_VERIFIED');
        assert(loginUnverifiedData.email === testEmail, 'Response includes user email for OTP resumption');

        const verifyOtp = await prisma.otpCode.findFirst({
            where: { email: testEmail.toLowerCase(), purpose: 'verify', used: false },
            orderBy: { createdAt: 'desc' },
        });
        assert(Boolean(verifyOtp), 'Fresh OTP code automatically generated on unverified login attempt');

        // ─── TEST 3: Half-Registered Lockout Bug Fix (Discovery 2) ───
        console.log('\n--- Test 3: Half-Registered Re-Registration (Discovery 2 Fix) ---');
        // User closes tab and tries to register again with updated details and new password
        const reRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Agent5 Tester Renamed',
                email: testEmail,
                password: updatedPassword,
                phone: '+91 9988776655',
                institution: 'Updated University',
                pincode: '500002',
            }),
        });
        const reRegData: any = await reRegRes.json();

        assert(reRegRes.status === 200, 'Re-registration of unverified account returns 200 OK (NOT 409)');
        assert(reRegData.user?.emailVerified === false, 'User remains pending verification');

        const dbUserUpdated = await prisma.user.findFirst({
            where: { email: { equals: testEmail, mode: 'insensitive' } },
        });
        assert(dbUserUpdated?.name === 'Agent5 Tester Renamed', 'Name updated on unverified account');
        const isNewPasswordValid = await bcrypt.compare(updatedPassword, dbUserUpdated?.passwordHash || '');
        assert(isNewPasswordValid, 'Password hash successfully updated to new credentials');

        // ─── TEST 4: Already Verified Email Conflict Guard ───
        console.log('\n--- Test 4: Already Verified Email Conflict Guard ---');
        verifiedEmail = `verified_${timestamp}@example.com`;
        const vHash = await bcrypt.hash('Secret@123', 10);
        await prisma.user.create({
            data: {
                name: 'Verified User',
                email: verifiedEmail,
                passwordHash: vHash,
                emailVerified: true,
            },
        });

        const verifiedRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Impoverished Imposter',
                email: verifiedEmail,
                password: 'OtherPassword@123',
            }),
        });
        const verifiedRegData: any = await verifiedRegRes.json();

        assert(verifiedRegRes.status === 409, 'Attempt to register verified email returns 409 Conflict');
        assert(verifiedRegData.error.includes('already registered'), 'Error message prompts to sign in');

        // ─── TEST 5: Case-Insensitive OTP Verification ───
        console.log('\n--- Test 5: Case-Insensitive OTP Verification ---');
        const sendOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, purpose: 'verify' }),
        });
        assert(sendOtpRes.status === 200, 'send-otp returns 200 OK');

        const latestOtpRecord = await prisma.otpCode.findFirst({
            where: { email: testEmail.toLowerCase(), purpose: 'verify', used: false },
            orderBy: { createdAt: 'desc' },
        });

        // Submit verification using uppercase/mixed casing email
        const mixedCaseEmail = testEmail.toUpperCase();
        const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: mixedCaseEmail,
                code: latestOtpRecord?.code,
                purpose: 'verify',
            }),
        });
        const verifyData: any = await verifyRes.json();

        assert(verifyRes.status === 200, 'verify-otp succeeds with mixed-case email');
        assert(verifyData.valid === true, 'Response confirms OTP is valid');

        const verifiedDbUser = await prisma.user.findFirst({
            where: { email: { equals: testEmail, mode: 'insensitive' } },
        });
        assert(verifiedDbUser?.emailVerified === true, 'Database record marked emailVerified: true');

        // ─── TEST 6: Login with Verified Credentials ───
        console.log('\n--- Test 6: Login with Verified Credentials ---');
        const loginVerifiedRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: updatedPassword }),
        });
        const loginVerifiedData: any = await loginVerifiedRes.json();

        assert(loginVerifiedRes.status === 200, 'Login with verified user returns 200 OK');
        assert(Boolean(loginVerifiedData.accessToken), 'Access token returned on successful login');
        assert(loginVerifiedData.user?.emailVerified === true, 'User profile returned with emailVerified === true');

        const authToken = loginVerifiedData.accessToken;

        // ─── TEST 7: Protected Route Gate ───
        console.log('\n--- Test 7: Protected Route Gate ---');
        const unauthRes = await fetch(`${BASE_URL}/api/test-protected`);
        assert(unauthRes.status === 401, 'Protected route returns 401 without Bearer token');

        const authRes = await fetch(`${BASE_URL}/api/test-protected`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const authData: any = await authRes.json();
        assert(authRes.status === 200, 'Protected route returns 200 with verified user token');
        assert(authData.user?.email === testEmail.toLowerCase(), 'Protected route resolves authenticated user');

        // ─── TEST 8: Admin Parity in Seed & Database ───
        console.log('\n--- Test 8: Admin Parity in Seed & Database ---');
        const adminUser = await prisma.user.findFirst({
            where: { email: { equals: 'admin@campusmart.in', mode: 'insensitive' } },
        });
        assert(Boolean(adminUser), 'Admin user exists in database');
        assert(adminUser?.emailVerified === true, 'Admin user emailVerified is true');

        const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@campusmart.in', password: 'Admin@1234' }),
        });
        const adminLoginData: any = await adminLoginRes.json();
        assert(adminLoginRes.status === 200, 'Admin can log in successfully');
        assert(adminLoginData.user?.role === 'admin', 'Admin user role is admin');

        // ─── TEST 9: Password Reset Flow ───
        console.log('\n--- Test 9: Password Reset Flow ---');
        const resetOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, purpose: 'reset' }),
        });
        assert(resetOtpRes.status === 200, 'send-otp with purpose reset returns 200');

        const resetRecord = await prisma.otpCode.findFirst({
            where: { email: testEmail.toLowerCase(), purpose: 'reset', used: false },
            orderBy: { createdAt: 'desc' },
        });

        const resetPasswordRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                code: resetRecord?.code,
                newPassword: resetPassword,
            }),
        });
        assert(resetPasswordRes.status === 200, 'reset-password returns 200 OK');

        const postResetLogin = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: resetPassword }),
        });
        assert(postResetLogin.status === 200, 'Login with new reset password succeeds');

        // ─── TEST 10: Invalid OTP Rejection ───
        console.log('\n--- Test 10: Invalid OTP Rejection & Edge Cases ---');
        const invalidOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, code: '000000', purpose: 'verify' }),
        });
        assert(invalidOtpRes.status === 400, 'Invalid OTP code returns 400 Bad Request');

        // Clean up test users
        await prisma.otpCode.deleteMany({
            where: { email: { in: [testEmail.toLowerCase(), verifiedEmail.toLowerCase()] } },
        });
        await prisma.user.deleteMany({
            where: { email: { in: [testEmail.toLowerCase(), verifiedEmail.toLowerCase()] } },
        });

    } catch (err: any) {
        console.error('Unexpected test error:', err);
        failedCount++;
    } finally {
        server.close();
        await prisma.$disconnect();
    }

    console.log('\n==========================================');
    console.log(`Agent 5 Test Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('==========================================\n');

    if (failedCount > 0) {
        process.exit(1);
    }
}

runTests();
