export const ChainId = {
  ETHEREUM: 1,
  // ROPSTEN: 3,
  // RINKEBY: 4,
  GÖRLI: 5,
  // KOVAN: 42,
  POLYGON: 137,
  POLYGON_TESTNET: 80001,
  FANTOM: 250,
  FANTOM_TESTNET: 4002,
  GNOSIS: 100,
  BSC: 56,
  BSC_TESTNET: 97,
  ARBITRUM: 42161,
  ARBITRUM_NOVA: 42170,
  ARBITRUM_TESTNET: 421614,
  AVALANCHE: 43114,
  AVALANCHE_TESTNET: 43113,
  HECO: 128,
  // HECO_TESTNET: 256,
  HARMONY: 1666600000,
  // HARMONY_TESTNET: 1666700000,
  OKEX: 66,
  // OKEX_TESTNET: 65,
  CELO: 42220,
  PALM: 11297108109,
  MOONRIVER: 1285,
  FUSE: 122,
  TELOS: 40,
  MOONBEAM: 1284,
  OPTIMISM: 10,
  KAVA: 2222,
  METIS: 1088,
  BOBA: 288,
  BOBA_AVAX: 43288,
  BOBA_BNB: 56288,
  BTTC: 199,
  SEPOLIA: 11155111,
  // CONSENSUS_ZKEVM_TESTNET: 59140,
  // SCROLL_ALPHA_TESTNET: 534353,
  // BASE_TESTNET: 84531,
  POLYGON_ZKEVM: 1101,
  THUNDERCORE: 108,
  FILECOIN: 314,
  HAQQ: 11235,
  CORE: 1116,
  ZKSYNC_ERA: 324,
  LINEA: 59144,
  BASE: 8453,
  SCROLL: 534352,
  ZETACHAIN: 7000,
  CRONOS: 25,
  BLAST: 81457,
  SKALE_EUROPA: 2046399126,
  ROOTSTOCK: 30,
  // RONIN: 2020,
} as const
export type ChainId = (typeof ChainId)[keyof typeof ChainId]

export const TESTNET_CHAIN_IDS = [
  ChainId.ARBITRUM_TESTNET,
  ChainId.AVALANCHE_TESTNET,
  ChainId.BSC_TESTNET,
  ChainId.FANTOM_TESTNET,
  // ChainId.HECO_TESTNET,
  // ChainId.HARMONY_TESTNET,
  // ChainId.OKEX_TESTNET,
  ChainId.POLYGON_TESTNET,
  ChainId.SEPOLIA,
  // ChainId.ROPSTEN,
  // ChainId.RINKEBY,
  // ChainId.GÖRLI,
  // ChainId.KOVAN,
] as const
export type TestnetChainId = (typeof TESTNET_CHAIN_IDS)[number]

export const isChainId = (chainId: number): chainId is ChainId =>
  Object.values(ChainId).includes(chainId as ChainId)

export const ChainKey = {
  [ChainId.ARBITRUM]: 'arbitrum',
  [ChainId.ARBITRUM_NOVA]: 'arbitrum-nova',
  [ChainId.ARBITRUM_TESTNET]: 'arbitrum-testnet',
  [ChainId.AVALANCHE]: 'avalanche',
  [ChainId.AVALANCHE_TESTNET]: 'avalance-testnet',
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bsc-testnet',
  [ChainId.CELO]: 'celo',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.FANTOM_TESTNET]: 'fantom-testnet',
  [ChainId.FUSE]: 'fuse',
  [ChainId.GÖRLI]: 'goerli',
  [ChainId.HARMONY]: 'harmony',
  // [ChainId.HARMONY_TESTNET]: 'harmony-testnet',
  [ChainId.HECO]: 'heco',
  // [ChainId.HECO_TESTNET]: 'heco-testnet',
  // [ChainId.KOVAN]: 'kovan',
  // [ChainId.ROPSTEN]: 'ropsten',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.POLYGON_TESTNET]: 'matic-testnet',
  [ChainId.MOONBEAM]: 'moonbeam',
  // [ChainId.MOONBEAM_TESTNET]: 'moonbeam-testnet',
  [ChainId.MOONRIVER]: 'moonriver',
  [ChainId.OKEX]: 'okex',
  // [ChainId.OKEX_TESTNET]: 'okex-testnet',
  [ChainId.PALM]: 'palm',
  // [ChainId.PALM_TESTNET]: 'palm-testnet',
  // [ChainId.RINKEBY]: 'rinkeby',
  [ChainId.TELOS]: 'telos',
  [ChainId.GNOSIS]: 'gnosis',
  [ChainId.OPTIMISM]: 'optimism',
  [ChainId.KAVA]: 'kava',
  [ChainId.METIS]: 'metis',
  [ChainId.BOBA]: 'boba',
  [ChainId.BOBA_AVAX]: 'boba-avax',
  [ChainId.BOBA_BNB]: 'boba-bnb',
  [ChainId.BTTC]: 'bttc',
  // [ChainId.CONSENSUS_ZKEVM_TESTNET]: 'consensus-zkevm-testnet',
  // [ChainId.SCROLL_ALPHA_TESTNET]: 'scroll-alpha-testnet',
  // [ChainId.BASE_TESTNET]:'base-testnet',
  [ChainId.POLYGON_ZKEVM]: 'polygon-zkevm',
  [ChainId.THUNDERCORE]: 'thundercore',
  [ChainId.HAQQ]: 'haqq',
  [ChainId.CORE]: 'core',
  [ChainId.ZKSYNC_ERA]: 'zksync-era',
  [ChainId.LINEA]: 'linea',
  [ChainId.BASE]: 'base',
  [ChainId.FILECOIN]: 'filecoin',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.SCROLL]: 'scroll',
  [ChainId.ZETACHAIN]: 'zetachain',
  [ChainId.CRONOS]: 'cronos',
  [ChainId.BLAST]: 'blast',
  [ChainId.SKALE_EUROPA]: 'skale-europa',
  [ChainId.ROOTSTOCK]: 'rootstock',
} as const
export type ChainKey = (typeof ChainKey)[keyof typeof ChainKey]
