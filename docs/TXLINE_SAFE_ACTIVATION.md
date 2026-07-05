# TxLINE Safe Activation

Updated: 2026-07-05

## Why this exists

TxLINE activation requires a wallet signature, but private keys and seed phrases must never be shared with Codex, GitHub, Superteam, Telegram, or a public chat.

If a private key has been pasted into chat, treat that wallet as compromised and create a new clean wallet for testing.

TxLINEChat clarified on 2026-07-05 that the hackathon free tier is self-serve on devnet. Use a funded devnet wallet, run the on-chain subscribe transaction, then activate with `/api/token/activate`. Do not share JWT publicly. If sponsor support is needed, share only the public wallet address and subscribe transaction signature.

## Safe helper pages

The project includes a browser-wallet subscribe helper for the required on-chain free-tier registration:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-subscribe/
```

It also includes a browser-wallet activation helper:

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-activation/
```

Neither helper asks for a private key. The subscribe helper uses wallet `signTransaction`; the activation helper uses wallet `signMessage`.

## Workflow

1. Create a clean Solana wallet.
2. Switch the wallet to devnet and fund it from a devnet faucet.
3. Use the subscribe helper or the official TxLINE docs to subscribe to the free World Cup tier on devnet.
4. Copy the subscription transaction signature as `txSig`. Without this on-chain subscription txSig, TxLINE will not issue an API token.
5. Open the activation helper page. If you came from the subscribe helper, `network` and `txSig` are prefilled.
6. Click `Preflight` to check HTTPS, wallet injection, `txSig`, guest JWT, and league-id formatting.
7. Click `Get guest JWT`, or paste the JWT from the official flow.
8. Connect the wallet.
9. Click `Test wallet signing` if the wallet is newly installed or signing fails. This signs a harmless local message and does not call TxLINE.
10. Click `Copy message` if you want to inspect the exact `txSig:leagues:jwt` activation string locally.
11. Sign the official activation message:

```text
txSig:leagues:jwt
```

For the default World Cup bundle with no selected leagues, the message is:

```text
txSig::jwt
```

This exact activation message format is also confirmed by the Rust SDK helper shared in TxLINEChat:

```text
${txSig}:${selectedLeagues.join(",")}:${jwt}
```

12. Click `Activate API token`.
13. Copy the returned token into local `.env.local` only.

## Signing troubleshooting

- If `Test wallet signing` fails, unlock the wallet extension, reconnect the site, approve the wallet popup, and refresh the helper page.
- If `Test wallet signing` succeeds but `Sign activation message` fails, check that both `txSig` and `Guest JWT` are filled and that the network matches the on-chain subscription.
- If `Get guest JWT` fails in the browser, it may be a TxLINE CORS/browser policy issue. Use the official TxLINE docs flow or support channel to obtain the guest JWT, then paste the JWT into the helper.
- If the wallet returns an unusual signature shape, use Phantom first. The helper now accepts common `Uint8Array`, array, Buffer-like, base64, hex, and base58 signature formats.
- If signing still fails, click `Copy safe diagnostics` and inspect only the non-secret fields: wallet provider flags, error code, network, `txSig` presence, and JWT length. Do not share private keys, seed phrases, full JWTs, or API tokens.

## Local env target

```bash
VITE_TXLINE_API_BASE=https://txline-dev.txodds.com
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
