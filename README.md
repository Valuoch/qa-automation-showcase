# QA Automation Showcase

[![QA automation](https://github.com/Valuoch/qa-automation-showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/Valuoch/qa-automation-showcase/actions/workflows/ci.yml)

A small, complete test-automation project by **Valentine Komulo** (Senior QA / Test Automation Engineer, Nairobi). It shows how I structure web UI, API contract and load tests, and how I run them as a CI quality gate.

The tests run against two public practice systems built for this purpose, [Sauce Demo](https://www.saucedemo.com) (web shop) and [Restful-Booker](https://restful-booker.herokuapp.com) (REST API), because my professional work is client code that I cannot publish.

| Layer | Tool | What it covers |
|---|---|---|
| Web UI | Playwright + TypeScript, page objects | Login (positive, locked-out, data-driven negatives, route protection), sorting, cart, checkout total, form validation, in **Chrome and Firefox** |
| API | Playwright request API + JSON Schema (Ajv) | Full booking lifecycle (create, read, filter, PUT, PATCH, delete), auth and permission checks, **contract validation** of every response |
| Load | k6 | Smoke load with thresholds on error rate, p95 latency and checks |
| CI | GitHub Actions | Static gate → tests and load in parallel → HTML report published to GitHub Pages; nightly schedule |

**Latest test report:** https://valuoch.github.io/qa-automation-showcase/ (published automatically after each run on `main`).

## How I approach it

- **Assert behaviour, not just status codes.** The checkout test checks that the order total equals the sum of the item prices; the PATCH test checks that only the given field changed and everything else is identical.
- **Contracts are explicit.** Every API response is validated against a JSON Schema with `additionalProperties: false`, so an unexpected or renamed field fails the build with a readable message (`/booking/totalprice must be integer`).
- **Tests own their data.** Each API run creates bookings with a unique name, so tests never depend on, or collide with, data others leave on a shared environment.
- **Known defects are documented, not hidden.** `tests/web/known-defects.spec.ts` asserts the *correct* behaviour for three real defects in Sauce Demo's `problem_user` and marks them `test.fail()`. The suite stays green while the defect exists and turns red when it is fixed, so the test gets updated rather than silently going stale.
- **Findings are recorded as tests.** Two API behaviours are worth raising with a team, and are pinned so any change is noticed:
  - a failed login returns **HTTP 200** with `{"reason":"Bad credentials"}` instead of 401;
  - creating a booking with missing fields returns **HTTP 500** instead of a 400 validation error.
- **Retries are not a fix.** Retries are off locally and limited to one in CI (only to absorb demo-site outages); traces and screenshots are kept for any failure.

## Run it

Requires Node 20+.

```bash
npm ci
npx playwright install chromium firefox
npm test               # everything
npm run test:web       # web UI in Chrome and Firefox
npm run test:api       # API only
npm run report         # open the HTML report
npm run load:smoke     # needs k6 installed (https://k6.io)
```

## Layout

```
pages/                 page objects (LoginPage, InventoryPage, CheckoutPage)
tests/web/             UI specs, including known-defects.spec.ts
tests/api/             API specs and a test-data builder
schemas/               JSON Schemas and an Ajv helper that returns readable violations
load/smoke.js          k6 smoke test with thresholds
.github/workflows/     CI pipeline
```

## About AI use

I use Claude Code and GitHub Copilot daily to draft tests and analyse failures. Nothing is kept until it has been run against the real system and the assertion has been checked to fail when the behaviour is wrong.

---

Contact: [LinkedIn](https://www.linkedin.com/in/valkomulo/)
