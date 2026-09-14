const test = require('node:test');
const assert = require('node:assert/strict');
const { AuthController } = require('../dist/features/auth/auth.controller');
const { AuthService } = require('../dist/features/auth/auth.service');
const { GiftsController } = require('../dist/features/gifts/gifts.controller');
const { SettingsController } = require('../dist/features/settings/settings.controller');
const { JwtStrategy } = require('../dist/features/auth/strategies/jwt.strategy');
const { RateLimitMiddleware } = require('../dist/common/middleware/rate-limit.middleware');

test('public registration always creates a regular user', async () => {
  let roleReceived = null;
  const controller = new AuthController({
    register: async (_username, _password, role) => {
      roleReceived = role;
      return { username: 'new-user', role };
    },
  });

  const result = await controller.register({ username: 'new-user', password: 'Secure-password1' });

  assert.equal(roleReceived, 'user');
  assert.equal(result.role, 'user');
});

test('rate limiter blocks a client after the authentication request limit', () => {
  const middleware = new RateLimitMiddleware();
  const request = { path: '/api/auth/login', ip: '127.0.0.1', socket: {} };
  const next = () => {};

  for (let attempt = 0; attempt < 10; attempt += 1) {
    middleware.use(request, {}, next);
  }

  assert.throws(
    () => middleware.use(request, {}, next),
    (error) => error.getStatus && error.getStatus() === 429,
  );
});

test('login signs a JWT only after password verification', async () => {
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash('a-secure-password', 10);
  const signedPayloads = [];
  const authService = new AuthService(
    {
      findByUsername: async () => ({
        _id: 'user-1', username: 'streamer', role: 'user', passwordHash, allowConnect: true, allowNpc: false,
      }),
    },
    { sign: (payload, options) => { signedPayloads.push({ payload, options }); return 'signed-token'; } },
  );

  const result = await authService.login('streamer', 'a-secure-password');
  assert.equal(result.accessToken, 'signed-token');
  assert.deepEqual(signedPayloads[0].payload, { sub: 'user-1', username: 'streamer', role: 'user' });
  await assert.rejects(() => authService.login('streamer', 'wrong-password'), /Tài khoản hoặc mật khẩu không chính xác/);
});

test('overlay token is read-only and expires in 24 hours', () => {
  const signedPayloads = [];
  const authService = new AuthService({}, {
    sign: (payload, options) => { signedPayloads.push({ payload, options }); return 'overlay-token'; },
  });

  assert.deepEqual(authService.createOverlayToken('streamer'), { accessToken: 'overlay-token', expiresIn: 86400 });
  assert.deepEqual(signedPayloads[0], {
    payload: { sub: 'streamer', username: 'streamer', role: 'overlay', scope: 'overlay' },
    options: { expiresIn: '24h' },
  });
});

test('JWT strategy accepts an overlay token supplied by the media URL', () => {
  process.env.JWT_SECRET = 'a-test-secret-that-is-longer-than-thirty-two-characters';
  const strategy = new JwtStrategy();
  assert.equal(strategy._jwtFromRequest({ headers: {}, query: { token: 'overlay-token' } }), 'overlay-token');
});

test('non-admin gift requests cannot read another streamer data', async () => {
  const usernames = [];
  const controller = new GiftsController({ findAllForUser: async (username) => { usernames.push(username); return []; } });

  await controller.findAll('another-streamer', { user: { role: 'user', username: 'owner' } });
  await controller.findAll('another-streamer', { user: { role: 'admin', username: 'admin' } });

  assert.deepEqual(usernames, ['owner', 'another-streamer']);
});

test('settings access is scoped to the signed-in user unless the caller is admin', async () => {
  const usernames = [];
  const controller = new SettingsController({
    getSettingsForUser: async (username) => { usernames.push(username); return { username }; },
  });

  await controller.getSettings({ user: { role: 'user', username: 'owner' } }, 'another-streamer');
  await controller.getSettings({ user: { role: 'admin', username: 'admin' } }, 'another-streamer');

  assert.deepEqual(usernames, ['owner', 'another-streamer']);
});
