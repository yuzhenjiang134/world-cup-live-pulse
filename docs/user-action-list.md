# User Action List

Updated: 2026-06-28

This is the exact list of items the user needs to provide or complete. Do not share secrets publicly, and do not commit private files.

## Step 1: Accounts

- [ ] Superteam Earn account
- [ ] GitHub account
- [ ] Telegram contact usable for hackathon communication
- [x] Deployment target: GitHub Pages
- [ ] Demo video hosting account or upload target

## Step 2: TxLINE API

Endpoint docs are already mapped. Give Codex only the safe integration materials:

- [x] TxLINE endpoint documentation
- [x] Endpoint base URL
- [x] Safe subscribe helper URL: `https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-subscribe/`
- [x] Safe activation helper URL: `https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-activation/`
- [ ] Free-tier subscription transaction signature (`txSig`) from TxLINE subscribe helper or official docs
- [ ] Which endpoints are allowed for this hackathon token
- [ ] Rate limit notes
- [ ] Whether browser CORS is allowed or a server-side proxy is required
- [ ] Whether the hackathon token is issued directly or activated through Solana sign-up / wallet signature
- [ ] Whether each World Cup fixture is real-time or 60-second delayed on the free tier
- [ ] Example response payloads with secrets removed

Keep private:

- API token
- Account password
- Verification code
- Wallet private key
- Seed phrase

When the token is ready, place it only in `.env.local`:

```bash
VITE_TXLINE_API_BASE=https://txline.txodds.com
VITE_TXLINE_PROXY_BASE=
VITE_TXLINE_API_TOKEN=your_real_x_api_token
VITE_TXLINE_SESSION_JWT=
VITE_TXLINE_FIXTURE_ID=17588325
```

For public GitHub Pages Live mode, do not put `VITE_TXLINE_API_TOKEN` into the deployed frontend. Put the real token in a secure proxy environment as `TXLINE_API_TOKEN`, then set only `VITE_TXLINE_PROXY_BASE` in the frontend build.

## Step 3: GitHub

- [ ] Decide repository owner/name
- [ ] Make repo public before final submission
- [ ] Confirm `.env` and `.env.local` are not committed
- [ ] Confirm GitHub Actions passes

Suggested repo name:

```text
world-cup-live-pulse
```

## Step 4: Deployment

- [ ] Wait for GitHub Actions Pages deployment to finish
- [ ] Open the GitHub Pages URL
- [ ] Verify desktop URL
- [ ] Verify mobile URL

## Step 5: Demo video

- [ ] Use `docs/demo-script.md`
- [ ] Keep final video under five minutes
- [ ] Show Replay mode first
- [ ] Jump to a dramatic moment
- [ ] Export/share the SVG card
- [ ] Show Live mode token-needed state or real TxLINE state
- [ ] Say the safety boundary clearly

## Step 6: Final Superteam submission

Fill:

- [ ] Project title
- [ ] One-line pitch
- [ ] Deployed app URL
- [ ] GitHub repo URL
- [ ] Demo video URL
- [ ] Technical write-up
- [ ] TxLINE endpoint list
- [ ] TxLINE API feedback

Deadline from the implementation report snapshot:

```text
2026-07-19 23:59 UTC
```

Re-check the live Superteam page before final submission because public competition details can change.
