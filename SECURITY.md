# Security Policy

## Supported Versions

Only the latest version deployed on the master/main branch (typically served via GitHub Pages) is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

As Squeeze.it is a client-side only static application (HTML5, Vanilla CSS, and JavaScript), the application's attack surface is minimal. There are no server-side operations, active database servers, or remote APIs communicating with user data. 

All metrics, stats, and achievements are persisted locally via the browser's `localStorage` API.

If you discover a vulnerability or security issue (e.g., potential Cross-Site Scripting or logic injection via UI components):
1. Please open an Issue in this repository detailing the steps to reproduce the exploit.
2. Alternatively, you can submit a Pull Request containing the proposed security patch directly.

All security feedback is highly appreciated, and we aim to review and address any valid concerns within 48 hours.
