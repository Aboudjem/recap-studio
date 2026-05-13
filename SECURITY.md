# Security Policy

## Reporting a vulnerability

If you find a security vulnerability in Recap Studio, please report it
responsibly. **Do not open a public issue.**

Email **boudjemaa.adam@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce
- Impact assessment (what data or systems are at risk)
- Suggested fix, if you have one

You will receive an acknowledgement within 48 hours and a follow-up with a
mitigation plan within 7 days.

## Recap Studio's defaults

Recap Studio is designed to fail safe:

- Every side effect (deploy, email, paid API) is **off by default**.
- Hooks refuse writes to `.env*`, secret-like paths, and destructive git commands.
- The Next.js renderer ships zero inline scripts with user data.
- The validation board includes a `security-privacy-reviewer` that scans
  generated content for known secret patterns and prompt-injection cues.

See [docs/security-and-privacy.md](docs/security-and-privacy.md) for the
full threat model.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Disclosure timeline

1. Report received.
2. Acknowledgement within 48 hours.
3. Investigation and fix planned within 7 days.
4. Patch released, advisory published, and reporter credited (with consent).
