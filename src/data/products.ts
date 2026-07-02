import { Product } from '@/types/ontology';

// Product/architecture options and listed-asset classifications from the LCX USA research corpus.
export const products: Product[] = [
  {
    id: 'NONCUSTODIAL_WALLET', name: 'Non-Custodial Wallet / API (Architecture Option A)',
    description: 'Software/API platform with third-party custody (e.g. Fireblocks, BitGo); user holds keys. Zero state licensing burden beyond federal MSB registration. Cannot offer fiat ramps under this model.',
    category: 'DeFi', status: 'Conditional', phase: 'Pre-launch',
    requirements: ['MSB_REG', 'SANCTIONS_SCREENING'], risks: ['Cannot offer fiat ramps while remaining non-custodial'], sourceAuthority: 1,
  },
  {
    id: 'FIAT_RAMP', name: 'Fiat On/Off Ramp',
    description: 'Third-party custody payment rail. Requires a banking partner and, in most states, an MTL — routed model with no direct crypto custody by LCX USA.',
    category: 'Fiat', status: 'Conditional', phase: 'Phase 2',
    requirements: ['MSB_REG', 'STATE_MTL', 'BANKING_PARTNER'], risks: ['Bank de-risking of crypto-adjacent accounts'], sourceAuthority: 1,
  },
  {
    id: 'CUSTODY', name: 'Custody & Vault (Segregated, Architecture Option B)',
    description: 'Customer funds held in segregated accounts; LCX USA never pools funds. Enables fiat ramps and institutional trust. MTL required in most states except Wyoming (SPDI charter route).',
    category: 'Custody', status: 'Blocked', phase: 'Phase 2',
    requirements: ['STATE_MTL', 'CUSTODY_QUALIFIED'], risks: ['Segregated custody still requires state-by-state MTL'], sourceAuthority: 1,
  },
  {
    id: 'EXCHANGE', name: 'Retail Spot Exchange (Omnibus Custody, Architecture Option C)',
    description: 'Full-service exchange with omnibus wallets; LCX USA controls all keys. Highest licensing burden — MTL + BitLicense (NY) + DFAL (CA) + WY SPDI where applicable — but maximum product flexibility.',
    category: 'Exchange', status: 'Blocked', phase: 'Phase 3',
    requirements: ['STATE_MTL', 'NY_BITLICENSE_REQ', 'CA_DFAL_REQ', 'CUSTODY_QUALIFIED', 'SAR_PROGRAM'], risks: ['Highest aggregate licensing burden', 'Custody concentration risk'], sourceAuthority: 1,
  },
  {
    id: 'STABLECOIN_RAILS', name: 'Stablecoin Payment Rails',
    description: 'USDC/USDT and similar fiat-backed stablecoins used for fiat ramps and fee payment. Not currently treated as a security by SEC/CFTC (no yield = no investment contract), but receiving/sending stablecoins can independently trigger MTL as fungible value transmission.',
    category: 'Stablecoin', status: 'Conditional', phase: 'Phase 2',
    requirements: ['STATE_MTL', 'TOKEN_LEGAL_OPINION'], risks: ['Reserve composition / redemption / issuer risk', 'De-peg risk'], sourceAuthority: 1,
  },
  {
    id: 'LCX_TOKEN', name: 'LCX Token',
    description: 'Exchange/utility token issued by an LCX-affiliated entity, used for fee discounts, platform access, rewards, and potential launchpad utility. Absent LCX Token-specific documentation, this analysis is a framework applied to typical exchange-token architecture and must be re-run once white paper and tokenomics are verified.',
    category: 'Token', status: 'Blocked', phase: 'Phase 3',
    requirements: ['TOKEN_LEGAL_OPINION', 'MARKETING_DISCLOSURE'], risks: [
      'Likely a security under Howey (investment of money, common enterprise, profit expectation from LCX\u2019s efforts)',
      'Self-listing and affiliated market making create a material conflict-of-interest disclosure burden',
      'Staking/yield programs and burn mechanics increase investment-contract risk',
    ], sourceAuthority: 2,
  },
  {
    id: 'BTC', name: 'Bitcoin (BTC)',
    description: 'Decentralized payment/store-of-value commodity with no issuer. Not a security per SEC/CFTC statements; NYDFS Greenlist-approved since 2015.',
    category: 'Token', status: 'Ready', phase: 'Phase 1',
    requirements: ['STATE_MTL'], risks: ['Standard MTL exposure on the transmission/custody side only'], sourceAuthority: 1,
  },
  {
    id: 'ETH', name: 'Ethereum (ETH)',
    description: 'Payment/governance commodity post-merge. Not currently treated as a security by the SEC; NYDFS Greenlist-approved since 2022. Native/liquid staking requires additional disclosure.',
    category: 'Token', status: 'Ready', phase: 'Phase 1',
    requirements: ['STATE_MTL'], risks: ['Staking mechanics and validator risk require disclosure'], sourceAuthority: 1,
  },
];
