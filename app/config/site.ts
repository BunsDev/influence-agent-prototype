import {
  Chain,
  avalancheFuji,
  polygonZkEvmCardona,
  scrollSepolia,
} from "viem/chains";

export type SiteConfig = typeof siteConfig;

export type SiteConfigContracts = {
  chain: Chain;
  offerToken: `0x${string}`;
  usdToken: `0x${string}`;
  profileToken: `0x${string}`;
};

export const siteConfig = {
  emoji: "🕺",
  name: "Influence Agent",
  description:
    "A platform for finding and controlling influencers powered by smart contracts and AI",
  links: {
    github: "https://github.com/web3goals/influence-agent-prototype",
  },
  contracts: {
    avalancheFuji: {
      chain: avalancheFuji,
      offerToken: "0x4518BA8A80a1555402A4c75D631c36338b5b58c4" as `0x${string}`,
      usdToken: "0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59" as `0x${string}`,
      profileToken:
        "0x9a1C3C845BAd2585210913914Bf88242460062E9" as `0x${string}`,
    } as SiteConfigContracts,
    polygonZkEvmCardona: {
      chain: polygonZkEvmCardona,
      offerToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      usdToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      profileToken:
        "0x0000000000000000000000000000000000000000" as `0x${string}`,
    } as SiteConfigContracts,
    scrollSepolia: {
      chain: scrollSepolia,
      offerToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      usdToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      profileToken:
        "0x0000000000000000000000000000000000000000" as `0x${string}`,
    } as SiteConfigContracts,
  },
};
