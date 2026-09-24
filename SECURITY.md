# Security Policy

The **Wish Pacing** project takes security and data privacy seriously. This document outlines our policy for reporting security vulnerabilities and describes our security practices.

---

## 🛡️ Supported Versions

We actively provide security updates for the following versions of **Wish Pacing**:

| Version        | Supported | Notes                                    |
| :------------- | :-------: | :--------------------------------------- |
| `main` / `1.x` |    ✅     | Active development & production releases |
| `< 1.0.0`      |    ❌     | Legacy experimental releases             |

---

## 📩 Reporting a Vulnerability

If you discover a security vulnerability or potential privacy issue in this repository, **please do not disclose it publicly** in a public issue or discussion.

### How to Report

1. **Email**: Send details of the vulnerability to [security@wishpacing.com](mailto:security@wishpacing.com) or reach out privately to maintainers via GitHub Security Advisories.
2. **Details to Include**:
   - Description of the vulnerability and its potential impact.
   - Step-by-step instructions or proof-of-concept (PoC) to reproduce the issue.
   - Any proposed remediation or mitigation steps if available.

### What to Expect

- **Acknowledgement**: We aim to acknowledge receipt of security vulnerability reports within **24–48 hours**.
- **Assessment**: We will evaluate the report, verify the impact, and keep you informed of our progress.
- **Resolution**: Once a fix is ready, we will publish an update and credit reporters (unless anonymity is requested).

---

## 🔒 Safe Harbor

We consider ethical security research conducted under this policy to be:

- **Authorized** and beneficial to the community.
- Exempt from legal action regarding unauthorized access, provided researchers act in good faith, avoid data destruction or privacy violations, and adhere to responsible disclosure timelines.

---

## 🏛️ Security Architecture & Practices

**Wish Pacing** incorporates defence-in-depth measures across the stack:

1. **Authentication & Identity**:
   - Authentication is handled exclusively via **Clerk Auth** (`@clerk/backend` & `@clerk/clerk-react`).
   - No user password credentials or sensitive auth tokens are stored directly in application databases.

2. **Data Isolation & Storage**:
   - User database schemas (`plans`, `wish_items`, `users`) enforce user ID isolation across all queries.
   - Serverless API handlers at `/api/plan` enforce token verification prior to database access.

3. **Secret Management**:
   - Environment variables and secrets are managed via **Doppler** and Vercel encrypted environment variables.
   - Secrets are never committed to version control.

4. **Dependency Scanning & Automated Quality Gates**:
   - Continuous Integration (`.github/workflows/ci.yml`) runs automated type checking, linting, unit testing, and E2E validation on all pull requests.
