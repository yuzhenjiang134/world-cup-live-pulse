# TxLINE Safe Activation

Updated: 2026-07-01

## Why this exists

TxLINE activation requires a wallet signature, but private keys and seed phrases must never be shared with Codex, GitHub, Superteam, Telegram, or a public chat.

If a private key has been pasted into chat, treat that wallet as compromised and create a new clean wallet for testing.

## Safe helper page

The project includes a browser-wallet helper:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-activation/
```

It does not ask for a private key. It uses the browser wallet's `signMessage` capability.

## Workflow

1. Create a clean Solana wallet.
2. Use the official TxLINE docs to subscribe to the free World Cup tier.
3. Copy the subscription transaction signature as `txSig`.
4. Open the helper page.
5. Click `Get guest JWT`, or paste the JWT from the official flow.
6. Connect the wallet.
7. Sign the official activation message:

```text
txSig:leagues:jwt
```

For the default World Cup bundle with no selected leagues, the message is:

```text
txSig::jwt
```

8. Click `Activate API token`.
9. Copy the returned token into local `.env.local` only.

## Local env target

```bash
VITE_TXLINE_API_BASE=https://txline.txodds.com
VITE_TXLINE_PROXY_BASE=
VITE_TXLINE_API_TOKEN=your_real_x_api_token
VITE_TXLINE_SESSION_JWT=your_guest_jwt_if_you_have_one
VITE_TXLINE_FIXTURE_ID=17588325
```

Then run:

```bash
npm run txline:probe
```

## Boundaries

- Do not paste private keys or seed phrases into the helper.
- Do not commit `.env.local`.
- Do not put the real `X-Api-Token` into GitHub Pages build settings.
- Public Live mode should use a secure proxy through `VITE_TXLINE_PROXY_BASE`.

