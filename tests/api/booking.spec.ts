import { test, expect, type APIRequestContext } from '@playwright/test';
import { buildBooking } from './data';
import { violations } from '../../schemas';

// Restful-Booker's public demo credentials (documented on the site, not a secret).
const ADMIN = { username: 'admin', password: 'password123' };

async function token(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth', { data: ADMIN });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.token, 'auth should return a token').toEqual(expect.any(String));
  return body.token;
}

test.describe('Booking API: CRUD lifecycle', () => {
  test.describe.configure({ mode: 'serial' });
  let id: number;
  let auth: string;
  const booking = buildBooking();

  test.beforeAll(async ({ request }) => {
    auth = await token(request);
  });

  test('create returns the stored booking and matches the contract', async ({ request }) => {
    const res = await request.post('/booking', { data: booking });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(violations('created', body)).toEqual([]);
    expect(body.booking).toEqual(booking);
    id = body.bookingid;
  });

  test('read returns exactly what was created', async ({ request }) => {
    const res = await request.get(`/booking/${id}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(violations('booking', body)).toEqual([]);
    expect(body).toEqual(booking);
  });

  test('new booking is findable by name filter', async ({ request }) => {
    const res = await request.get('/booking', { params: { firstname: booking.firstname, lastname: booking.lastname } });
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(violations('idList', list)).toEqual([]);
    expect(list.map((b: { bookingid: number }) => b.bookingid)).toContain(id);
  });

  test('full update (PUT) replaces every field', async ({ request }) => {
    const updated = buildBooking({ firstname: 'Updated', totalprice: 999, depositpaid: false });
    const res = await request.put(`/booking/${id}`, { data: updated, headers: { Cookie: `token=${auth}` } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  test('partial update (PATCH) changes only the given field', async ({ request }) => {
    const before = await (await request.get(`/booking/${id}`)).json();
    const res = await request.patch(`/booking/${id}`, {
      data: { additionalneeds: 'Late checkout' },
      headers: { Cookie: `token=${auth}` },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ...before, additionalneeds: 'Late checkout' });
  });

  test('delete removes the booking', async ({ request }) => {
    const res = await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${auth}` } });
    // Observed behaviour: delete answers 201 Created rather than 200/204. Asserted so a change is noticed.
    expect(res.status()).toBe(201);
    expect((await request.get(`/booking/${id}`)).status()).toBe(404);
  });
});

test.describe('Booking API: security and negative cases', () => {
  test('update without a token is refused', async ({ request }) => {
    const created = await (await request.post('/booking', { data: buildBooking() })).json();
    const res = await request.put(`/booking/${created.bookingid}`, { data: buildBooking({ firstname: 'Hacker' }) });
    expect(res.status()).toBe(403);
    expect((await (await request.get(`/booking/${created.bookingid}`)).json()).firstname).toBe('QA');
  });

  test('delete with an invalid token is refused', async ({ request }) => {
    const created = await (await request.post('/booking', { data: buildBooking() })).json();
    const res = await request.delete(`/booking/${created.bookingid}`, { headers: { Cookie: 'token=not-a-real-token' } });
    expect(res.status()).toBe(403);
  });

  test('unknown booking id returns 404', async ({ request }) => {
    expect((await request.get('/booking/999999999')).status()).toBe(404);
  });

  test('FINDING: bad credentials return HTTP 200 instead of 401', async ({ request }) => {
    // Documented finding: a failed login is reported in the body, not the status code,
    // so clients that only check the status would treat it as success.
    const res = await request.post('/auth', { data: { username: 'admin', password: 'wrong' } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ reason: 'Bad credentials' });
  });

  test('FINDING: create with missing required fields returns a server error', async ({ request }) => {
    // Documented finding: invalid input should be a 400 with a message; the API answers 500.
    const res = await request.post('/booking', { data: { firstname: 'OnlyFirstName' } });
    expect(res.status()).toBe(500);
  });
});
