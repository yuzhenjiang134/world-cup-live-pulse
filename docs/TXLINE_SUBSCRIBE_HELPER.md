# TxLINE Subscribe Helper

Updated: 2026-07-01

## Why this exists

TxLINE does not issue the World Cup free-tier API token from a plain wallet signature alone. The official flow first registers a free subscription on Solana, producing a subscription transaction signature named `txSig`. The activation step then signs:

```text
txSig:leagues:jwt
```

World Cup Live Pulse now includes a browser-wallet subscribe helper so this missing step can be completed without sharing private keys or seed phrases.

## Helper page

```text
https://yuzhenjiang134.github.io/world-cup-live-pulse/tools/txline-subscribe/
```

It uses the connected browser wallet to send the official TxLINE `subscribe(serviceLevel, durationWeeks)` instruction. It never asks for a wallet private key, seed phrase, API token, or verification code.

## Workflow

1. Create or unlock a clean Solana wallet.
2. Open the subscribe helper.
3. Select the same network you will use for activation.
4. Keep `Service Level 1` for delayed free data, or use `Service Level 12` for mainnet real-time free data when available.
5. Keep duration at `4` weeks unless the official docs say otherwise.
6. Click `Connect wallet`.
7. Click `Load TxLINE IDL`.
8. Click `Subscribe free tier`.
9. Review and approve the wallet transaction.
10. Copy the returned `txSig`, or click `Open activation helper`.
11. In the activation helper, get or paste a guest JWT and activate the API token.

## Safety notes

- Free tier has no TxL payment, but Solana still requires a small SOL network fee.
- Devnet subscriptions must be activated on the devnet TxLINE API host.
- Mainnet subscriptions must be activated on the mainnet TxLINE API host.
- If the IDL cannot be fetched, check the RPC URL, selected network, and official program id.
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
