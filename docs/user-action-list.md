# User Action List

Updated: 2026-06-28

This is the exact list of items the user needs to provide or complete. Do not share secrets publicly, and do not commit private files.

## Step 1: Accounts

- [ ] Superteam Earn account
- [ ] GitHub account
- [ ] Telegram contact usable for hackathon communication
- [ ] Deployment account, preferably Vercel
- [ ] Demo video hosting account or upload target

## Step 2: TxLINE API

Give Codex only the safe integration materials:

- [ ] TxLINE endpoint documentation
- [ ] Endpoint base URL
- [ ] Which endpoints are allowed for this hackathon
- [ ] Rate limit notes
- [ ] Example response payloads with secrets removed

Keep private:

- API token
- Account password
- Verification code

When the token is ready, place it only in `.env.local`:

```bash
VITE_TXLINE_API_KEY=your_real_token
VITE_TXLINE_API_BASE=official_base_url
```

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

- [ ] Import GitHub repo into Vercel
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Add env vars only in the deployment dashboard, not in Git
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
