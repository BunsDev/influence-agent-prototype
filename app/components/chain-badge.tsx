"use client";

import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { Badge } from "./ui/badge";

export function ChainBadge(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);

  return <Badge variant="secondary">{contracts.chain.name}</Badge>;
}
