// k6 smoke test: a light, polite load against a shared public demo API.
// It checks the service stays correct and fast under a few concurrent users; it is not a stress test.
import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE = __ENV.BASE_URL || 'https://restful-booker.herokuapp.com';

export const options = {
  vus: 3,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],             // under 1% errors
    'http_req_duration{type:read}': ['p(95)<1500'], // 95% of reads under 1.5 s
    checks: ['rate>0.99'],
  },
};

export default function () {
  group('health', () => {
    const res = http.get(`${BASE}/ping`, { tags: { type: 'read' } });
    check(res, { 'ping is 201': (r) => r.status === 201 });
  });

  group('list and read', () => {
    const list = http.get(`${BASE}/booking`, { headers: { Accept: 'application/json' }, tags: { type: 'read' } });
    check(list, { 'list is 200': (r) => r.status === 200, 'list is non-empty': (r) => r.json().length > 0 });
    const ids = list.json();
    if (ids.length) {
      const id = ids[Math.floor(Math.random() * ids.length)].bookingid;
      const one = http.get(`${BASE}/booking/${id}`, { headers: { Accept: 'application/json' }, tags: { type: 'read' } });
      // Other users delete bookings on this shared API, so a 404 between list and read is acceptable.
      check(one, { 'read is 200 or 404': (r) => r.status === 200 || r.status === 404 });
    }
  });

  sleep(1);
}
