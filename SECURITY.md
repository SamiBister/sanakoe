# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Sanakoe team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email:** Send details to [INSERT SECURITY EMAIL]
2. **GitHub Security Advisory:** Use GitHub's [private vulnerability reporting](https://github.com/OWNER/sanakoe/security/advisories/new)

### What to Include

Please include the following information in your report:

- **Description:** A clear description of the vulnerability
- **Type:** The type of vulnerability (e.g., XSS, CSRF, injection)
- **Location:** File path and line numbers where the vulnerability exists
- **Impact:** Potential impact and attack scenarios
- **Reproduction:** Step-by-step instructions to reproduce the issue
- **Proof of Concept:** Code, screenshots, or videos demonstrating the vulnerability
- **Suggested Fix:** If you have ideas on how to remediate
- **Environment:** Browser/OS versions if applicable

### What to Expect

- **Acknowledgment:** We'll acknowledge receipt within 48 hours
- **Investigation:** We'll investigate and validate the report
- **Updates:** We'll keep you informed of our progress
- **Timeline:** We aim to patch critical vulnerabilities within 7 days
- **Credit:** We'll credit you in the security advisory (unless you prefer to remain anonymous)

### Response Timeline

| Severity | Response Time | Patch Timeline |
| -------- | ------------- | -------------- |
| Critical | 24 hours      | 7 days         |
| High     | 48 hours      | 14 days        |
| Medium   | 1 week        | 30 days        |
| Low      | 2 weeks       | 60 days        |

## Security Best Practices for Users

### Client-Side Security

Since Sanakoe is a client-side application, please be aware:

1. **Data Storage**
   - All data is stored in browser localStorage
   - Data is not encrypted by default
   - Clearing browser data will delete all records

2. **File Uploads**
   - Only upload CSV files from trusted sources
   - Be cautious with files containing formulas (CSV injection)
   - Do not upload files containing sensitive information

3. **Browser Security**
   - Keep your browser updated
   - Use browsers with good security practices
   - Be cautious of browser extensions that access page data

### Recommended Practices

1. **Regular Backups**
   - Export your word lists regularly
   - Store backups securely

2. **Privacy**
   - Avoid storing personally identifiable information in word lists
   - Be aware that localStorage is not encrypted

3. **Browser Extensions**
   - Disable extensions that might access page data
   - Use privacy-focused browsers for sensitive content

## Known Security Considerations

### By Design

The following are inherent to Sanakoe's architecture:

1. **localStorage Access**
   - Data stored in browser localStorage is accessible via JavaScript
   - Other scripts on the same domain can access this data
   - **Mitigation:** Don't store sensitive information

2. **No Authentication**
   - Application has no user accounts or authentication
   - Anyone with physical access to the device can view data
   - **Mitigation:** Use device-level security (passwords, encryption)

3. **Client-Side Only**
   - No server-side validation or sanitization
   - All logic runs in the browser
   - **Mitigation:** Input validation on client-side, React auto-escaping

### CSV Injection

While we've implemented protections:

- CSV parser treats all input as plain text
- No formula evaluation
- React automatically escapes output

**Still be cautious:** Only upload CSV files from trusted sources.

### Cross-Site Scripting (XSS)

Protections in place:

- React automatically escapes content
- No use of `dangerouslySetInnerHTML`
- Content Security Policy headers recommended

**User responsibility:** Don't paste untrusted content into the application.

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed.

### Notification Channels

Security advisories will be published through:

1. GitHub Security Advisories
2. Release notes (for non-critical fixes)
3. README.md security section
4. CHANGELOG.md

### Applying Updates

To stay secure:

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# For breaking changes, check CHANGELOG.md
git pull origin main
npm install
```

## Vulnerability Disclosure Policy

When we receive a security report:

1. **Confirmation:** We'll confirm the vulnerability exists
2. **Development:** We'll develop a patch
3. **Testing:** We'll test the fix thoroughly
4. **Coordination:** We'll coordinate disclosure with the reporter
5. **Release:** We'll release the patch
6. **Disclosure:** We'll publish a security advisory
7. **Recognition:** We'll credit the reporter (if they wish)

### Public Disclosure

- **Timing:** After patch is released and users have time to update (typically 7-14 days)
- **Content:** Vulnerability details, impact, and mitigation steps
- **Credit:** Reporter credited in advisory (unless anonymous)

## Bug Bounty Program

We currently do not have a bug bounty program. However, we deeply appreciate security researchers and will:

- Acknowledge your contribution publicly
- List you in our Hall of Fame
- Provide a reference for your portfolio

## Security-Related Configuration

### Content Security Policy

For production deployments, we recommend setting these CSP headers:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Additional Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Contact

For security-related questions or concerns:

- **Security Issues:** [INSERT SECURITY EMAIL]
- **General Questions:** [INSERT GENERAL EMAIL]
- **GitHub Discussions:** [Project Discussions](https://github.com/OWNER/sanakoe/discussions)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [localStorage Security](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#security)

Thank you for helping keep Sanakoe and its users safe!
