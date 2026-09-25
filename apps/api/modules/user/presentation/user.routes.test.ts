import { describe, expect, test } from 'bun:test';
import { Hono } from 'hono';
import { registerErrorHandler } from '../../../errors/error-handler';
import usersRoutes from './user.routes';

function testApp() {
  const app = new Hono();
  registerErrorHandler(app);
  app.route('/users', usersRoutes);
  return app;
}

describe('user routes', () => {
  test('does not expose public signup', async () => {
    const response = await testApp().request('/users/register', { method: 'POST' });
    expect(response.status).toBe(404);
  });

  test('requires authentication for administrator user creation', async () => {
    const response = await testApp().request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: { firstName: 'Admin' },
        email: 'admin@example.com',
        password: 'Password1',
        role: 'admin',
      }),
    });
    expect(response.status).toBe(401);
  });

  test('does not expose self-update or self-delete routes', async () => {
    const app = testApp();
    const update = await app.request('/users/00000000-0000-7000-8000-000000000000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com' }),
    });
    const deletion = await app.request('/users/me/soft', { method: 'DELETE' });

    expect(update.status).toBe(401);
    expect(deletion.status).toBe(404);
  });
});
