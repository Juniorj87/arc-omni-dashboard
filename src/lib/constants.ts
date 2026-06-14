export const ARC_NETWORK = {
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  chainId: 5042002,
  explorer: "https://testnet.arcscan.app",
  currency: "USDC",
};

export const TOKENS = {
  USDC: {
    symbol: "USDC",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 18,
    isNative: true,
  },
  EURC: {
    symbol: "EURC",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
  },
};

export const PROTOCOLS = {
  ACHSWAP: {
    name: "Achswap",
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    factory: "0x60ED395d3F37A8C822f360F6239D21c5651B79e2",
  },
  PRESTODEX: {
    name: "PrestoDEX",
    router: "0x443a47ef66236b284e3146437537b037380b0b0b",
  },
  CURVE: {
    name: "Curve",
    addressProvider: "0x911b4000D3422F482F4062a913885f7b035382Df",
  },
  ARC_PERP: {
    name: "ArcPerps",
    engine: "0x9A676e781A523b5d0C0e43731313A708CB607508",
  },
  SYNTHRA: {
    name: "Synthra",
    router: "0x74133b5D179a7827e1343a8bF11330603d215634",
  },
  MISSIONS: {
    name: "ArcMissions",
    contract: "0x424fF7f4A7CBB654E5168829C8535be3C0ef2e6c",
  },
};
