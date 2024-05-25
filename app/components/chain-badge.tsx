"use client";

import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { Badge } from "./ui/badge";

export function ChainBadge(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);

  return (
    <Badge variant="secondary" className="py-1.5 px-3">
      {contracts.chain.name}
    </Badge>
  );
}
