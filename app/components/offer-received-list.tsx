"use client";

import { offerTokenAbi } from "@/contracts/abi/offer-token";
import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { useEffect, useState } from "react";
import { isAddressEqual } from "viem";
import { useAccount, useInfiniteReadContracts } from "wagmi";
import EntityList from "./entity-list";
import { OfferCard } from "./offer-card";

const LIMIT = 42;

export function OfferReceivedList(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { address } = useAccount();
  const [offers, setOffers] = useState<string[] | undefined>();

  const { data } = useInfiniteReadContracts({
    cacheKey: `offer_received_list_${contracts.chain.id.toString()}`,
    contracts(pageParam) {
      return [...new Array(LIMIT)].map(
        (_, i) =>
          ({
            address: contracts.offerToken,
            abi: offerTokenAbi,
            functionName: "getContent",
            args: [BigInt(pageParam + i)],
            chainId: contracts.chain.id,
          } as const)
      );
    },
    query: {
      initialPageParam: 0,
      getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
        return lastPageParam + 1;
      },
    },
  });

  useEffect(() => {
    setOffers(undefined);
    if (data && address) {
      const offers: string[] = [];
      const dataFirstPage = (data as any).pages[0];
      for (let i = 0; i < dataFirstPage.length; i++) {
        const dataPageElement = dataFirstPage[i];
        if (isAddressEqual(dataPageElement.result.recipient, address)) {
          offers.push(String(i));
        }
      }
      setOffers(offers);
    }
  }, [data, address]);

  return (
    <EntityList
      entities={offers?.toReversed()}
      renderEntityCard={(offer, index) => (
        <OfferCard key={index} offer={offer} contracts={contracts} />
      )}
      noEntitiesText={`No offers on ${contracts.chain.name} 😐`}
      className="gap-6"
    />
  );
}
