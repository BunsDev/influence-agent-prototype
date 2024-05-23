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
      offerToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      usdToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    } as SiteConfigContracts,
    polygonZkEvmCardona: {
      chain: polygonZkEvmCardona,
      offerToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      usdToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    } as SiteConfigContracts,
    scrollSepolia: {
      chain: scrollSepolia,
      offerToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      usdToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    } as SiteConfigContracts,
  },
};
