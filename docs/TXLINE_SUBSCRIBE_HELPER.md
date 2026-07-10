# TxLINE Subscribe Helper

Updated: 2026-07-10

## Why this exists

TxLINE does not issue the World Cup free-tier API token from a plain wallet signature alone. The official flow first registers a free subscription on Solana, producing a subscription transaction signature named `txSig`. The activation step then signs:

```text
txSig:leagues:jwt
```

World Cup Live Pulse now includes a browser-wallet subscribe helper so this missing step can be completed without sharing private keys or seed phrases.

TxLINEChat clarified on 2026-07-05 that the hackathon free tier is self-serve on devnet: use a funded devnet wallet, run the free-tier subscribe transaction, then call `/api/token/activate` with the signed activation payload. Do not share JWT publicly; if support is needed, share only the public wallet address and subscribe `txSig`.

## Helper page

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-subscribe/
```

It uses the connected browser wallet to send the official TxLINE `subscribe(serviceLevel, durationWeeks)` instruction. It never asks for a wallet private key, seed phrase, API token, or verification code.

Reference implementations checked on 2026-07-05:

- Official TypeScript devnet examples: `txodds/tx-on-chain`, `examples/devnet/scripts/subscription_free_tier.ts`
- Rust SDK helper shared in TxLINEChat: `Berektassuly/txline-rs`, `crates/txline/examples/devnet_setup_user.rs`

Both align with the helper defaults: devnet, service level `1`, duration `4` weeks.

## Workflow

1. Create or unlock a clean Solana wallet.
2. Switch the wallet to devnet and fund it from a devnet faucet.
3. Open the subscribe helper.
4. Keep `Devnet / hackathon free tier`.
5. Keep `Service Level 1`.
6. Keep duration at `4` weeks unless TxLINE says otherwise.
7. Click `Connect wallet`.
8. Click `Prepare instruction`.
9. Click `Subscribe free tier`.
10. Review and approve the wallet transaction.
11. Copy the returned `txSig`, or click `Open activation helper`.
12. In the activation helper, get or paste a guest JWT and activate the API token.

## Balance troubleshooting

The helper now checks both networks after wallet connection. A wallet address is the same on Devnet and Mainnet, but the balances are separate ledgers.

- If the page shows `Devnet 0 SOL` while Phantom shows real SOL, the funds are on Mainnet. They cannot pay a Devnet subscription. Keep the helper on Devnet and use faucet SOL.
- If the page shows `Mainnet 0 SOL` while the wallet has faucet SOL, the funds are on Devnet. Do not switch to Mainnet for the hackathon free tier.
- For the current hackathon route, use Devnet, service level `1`, and at least `0.005` faucet SOL. Mainnet SOL is not needed for this free-tier activation.
- If the default Solana Devnet RPC returns `403` or `Access forbidden`, the helper automatically tries the public Devnet RPC fallback and shows the active RPC in the advanced diagnostics.
- If a previous page showed `Cannot read properties of undefined (reading 'numRequiredSignatures')`, refresh the helper and reconnect Phantom. The helper now uses the wallet standard `sendTransaction` path first and leaves preflight to the Solana RPC.

## Safety notes

- Free tier has no TxL payment, but Solana still requires a small SOL network fee.
- Devnet means faucet SOL, not real SOL.
- Devnet subscriptions must be activated on the devnet TxLINE API host.
- Mainnet subscriptions must be activated on the mainnet TxLINE API host.
- If the instruction cannot be prepared, check the RPC URL, selected network, and official program id.
- If the wallet rejects the transaction, no subscription is created and no API token can be activated.

## Official constants used

Mainnet:

```text
Program ID: 9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA
TxL Mint: Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL
API Host: https://txline.txodds.com
```

Devnet:

```text
Program ID: 6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J
TxL Mint: 4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG
API Host: https://txline-dev.txodds.com
```
