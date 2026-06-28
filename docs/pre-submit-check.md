# Pre-submit Check

Run these checks before creating the public repository or submitting to Superteam Earn.

## Local commands

```bash
npm.cmd run check
npm.cmd run fixtures
npm.cmd run build
npm.cmd run preflight
npm.cmd run validate
```

## Secret scan

Confirm these files do not exist in the public repo:

- `.env`
- `.env.local`
- Any file containing an API token
- Any wallet private key
- Any seed phrase
- Any verification code

## Product safety

Confirm the app still avoids:

- Betting flows
- Trade recommendations
- Prediction market UX
- Wallet connection
- Custody or payment handling

## Demo readiness

- Replay mode works without live API data
- Live mode clearly explains missing TxLINE credentials when no token is configured
- Key moment jump buttons pause on the selected event
- Share card export works for a dramatic moment
- Mobile layout has no page-level horizontal overflow

## Submission fields

Prepare:

- Project title
- One-line pitch
- Deployed URL
- GitHub public repo URL
- Demo video URL
- Technical write-up
- TxLINE endpoint list
- TxLINE API feedback
