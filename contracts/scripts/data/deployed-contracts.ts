export const CONTRACTS: {
  [key: string]: {
    offerToken: `0x${string}` | undefined;
    usdToken: `0x${string}` | undefined;
    profileToken: `0x${string}` | undefined;
    functionsDonId: `0x${string}` | undefined;
    functionsRouter: `0x${string}` | undefined;
    functionsSubscriptionId: number | undefined;
  };
} = {
  avalancheFuji: {
    offerToken: "0x8364a4F0468d59ffFc47768047a30e50aC21Fe15",
    usdToken: "0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59",
    profileToken: "0x9a1C3C845BAd2585210913914Bf88242460062E9",
    functionsDonId:
      "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000",
    functionsRouter: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
    functionsSubscriptionId: 8661,
  },
  polygonCardona: {
    offerToken: "0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59",
    usdToken: "0x02008a8DBc938bd7930bf370617065B6B0c1221a",
    profileToken: "0xFe0AeD5cBEE89869FF505e10A5eBb75e9FC819D7",
    functionsDonId: undefined,
    functionsRouter: undefined,
    functionsSubscriptionId: undefined,
  },
};
