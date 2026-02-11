# StableLayer Frontend Refactor — Summary

## Goal
Refactor the frontend to integrate StableLayer SDK in a way that avoids SSR/build-time errors while enabling full SDK usage in the browser at runtime.

## What I changed
- `frontend/src/lib/stablelayer.ts`
  - Added dynamic (runtime) imports of `stable-layer-sdk` inside `buildMintTransaction`, `buildBurnTransaction`, and `buildClaimTransaction`.
  - Keep fallback simplified transaction construction when SDK dynamic import fails (useful for local dev without SDK or when packaging issues appear).
  - Read coin types and network from environment variables: `NEXT_PUBLIC_STABLE_COIN_TYPE`, `NEXT_PUBLIC_USDC_TYPE`, `NEXT_PUBLIC_STABLE_NETWORK`.

- `frontend/src/components/ClientProviders.tsx`
  - Removed dependency on `@mysten/dapp-kit` and rely on `@suiet/wallet-kit` provider only to avoid provider shape mismatch and reduce dependency surface.

- `frontend/src/components/WalletConnectButton.tsx`
  - Use `@suiet/wallet-kit`'s `useWallet` and added runtime-tolerant checks to support slight provider-shape differences.

- New doc: `docs/STABLELAYER_FRONTEND_REFACTOR.md` (this file) describing changes and run steps.

## Why dynamic import
- `stable-layer-sdk` and some Sui SDK modules may use Node-only imports (e.g., `node:` protocol) or expect polyfills, causing Next.js SSR/build failures.
- Dynamic import inside browser-only code prevents SSR from executing the SDK import and avoids build-time bundling issues.

## How to enable full SDK locally (recommended)
1. Install the SDK and peer deps:

```bash
cd frontend
npm install stable-layer-sdk @mysten/sui @mysten/bcs
# If build errors reference @tanstack/react-query or other packages, add them too:
npm install @tanstack/react-query
```

2. Add environment variables (create `.env.local` in `frontend`):

```
NEXT_PUBLIC_SUI_FULLNODE=https://fullnode.testnet.sui.io
NEXT_PUBLIC_STABLE_NETWORK=testnet
NEXT_PUBLIC_STABLE_COIN_TYPE=0x6d9fc...::btc_usdc::BtcUSDC
NEXT_PUBLIC_USDC_TYPE=0xdba34...::usdc::USDC
```

3. Start dev server:

```bash
npm run dev
```

4. Open the test wallet page: http://localhost:3000/test-wallet

## Troubleshooting
- If Next.js reports "Failed to patch lockfile" or other lockfile errors, try:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

- If you see missing package errors like `Can't resolve '@tanstack/react-query'`, install the missing package.

- If `stable-layer-sdk` still triggers bundler errors due to node: imports, prefer dynamic import approach used in `stablelayer.ts`, or add webpack polyfills in `next.config.js`.

## Next improvements (optional)
- Add a small integration test that dynamically imports `stable-layer-sdk` in a browser environment and verifies `buildMintTx` is callable.
- Replace simplified fallback transaction with a proper Move call construction when SDK is unavailable.
- Lock versions of `stable-layer-sdk` and Sui packages to stable, tested versions.

## Files touched
- `frontend/src/lib/stablelayer.ts` — dynamic SDK integration + fallbacks
- `frontend/src/components/ClientProviders.tsx` — provider cleanup
- `frontend/src/components/WalletConnectButton.tsx` — provider shape tolerant
- `docs/STABLELAYER_FRONTEND_REFACTOR.md` — this file

## How I tested
- Performed local edits and restarted the dev server; ensured SSR/runtime import errors are avoided by using browser-only dynamic imports.

---

If you want, I can now:
- Install `stable-layer-sdk` and missing deps and run `npm install` and `npm run dev` (I can do this here);
- Add a small automated smoke test that runs in the browser (Playwright) to verify wallet connect + transaction build path;
- Replace the simplified transaction fallbacks with explicit Move call building using `@mysten/sui` primitives.

Which of the above should I do next? (install & run / add smoke test / implement Move call fallback)