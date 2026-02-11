# StableTrade Frontend

A virtual goods trading platform on Sui blockchain.

## Features

- Buy virtual goods with USDC
- Sell virtual goods back to USDC (instant settlement)
- Claim trading rewards
- Real-time transaction feedback
- Guided trading flow
- Multi-network support (Mainnet, Testnet, Devnet)

## Tech Stack

- React 19 with TypeScript
- Vite
- Tailwind CSS v4
- HeroUI v3
- Zustand for state management
- @mysten/dapp-kit for Sui blockchain integration

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── config/         # Configuration files
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── postcss.config.mjs  # PostCSS configuration
```

## Configuration

### Networks

Networks are configured in `src/config/networks.ts`. Each network includes:
- Display name
- RPC URL
- USDC coin type
- USDC decimals

### Virtual Goods Brands

Virtual goods are configured in `src/config/brands.ts`. Each brand includes:
- Display name
- Coin type
- Decimals
- Supported redeem modes
- Tags and notes

## Components

### Main Components

- `TopNav` - Navigation bar with network and brand selectors
- `Hero` - Landing section
- `DemoPanel` - Main trading interface
- `FAQ` - Frequently asked questions
- `TxHistory` - Transaction history display

### Trading Components

- `BuyTab` - Buy virtual goods interface
- `SellTab` - Sell virtual goods interface
- `ClaimTab` - Claim rewards interface
- `BalancePanel` - Wallet balance display
- `PendingOrders` - Pending orders display
- `GuidedStepper` - Guided flow stepper
- `TxFeedbackCard` - Transaction feedback display

## Hooks

- `useBalances` - Fetch and manage wallet balances
- `useTransaction` - Handle transaction execution
- `useTxHistory` - Manage transaction history
- `usePendingOrders` - Manage pending orders
- `useGuidedFlow` - Manage guided trading flow

## State Management

The application uses Zustand for state management:

- `useAppStore` - Global application state (network, brand, address)
- `useTxHistoryStore` - Transaction history
- `usePendingOrdersStore` - Pending orders
- `useToastStore` - Toast notifications

## Styling

The application uses Tailwind CSS v4 with custom CSS variables for theming:

- Background: Dark blue gradient
- Accent colors: Cyan and Pink
- Glassmorphism effects
- Custom shadows and glows

## Blockchain Integration

The application integrates with Sui blockchain using `@mysten/dapp-kit`:

- Wallet connection
- Transaction building and signing
- Balance queries
- Transaction execution

## License

MIT
