"use client";

import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { useEffect, useState } from "react";
import { useAccount, useInfiniteReadContracts } from "wagmi";
import EntityList from "./entity-list";
import { OfferCard } from "./offer-card";
import { offerTokenAbi } from "@/contracts/abi/offer-token";
import { isAddressEqual } from "viem";

const LIMIT = 42;

export function OfferSentList(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { address } = useAccount();
  const [offers, setOffers] = useState<string[] | undefined>();

  const { data } = useInfiniteReadContracts({
    cacheKey: `offer_sent_list_${contracts.chain.id.toString()}`,
    contracts(pageParam) {
      return [...new Array(LIMIT)].map(
        (_, i) =>
          ({
            address: contracts.offerToken,
            abi: offerTokenAbi,
            functionName: "ownerOf",
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
        console.log({ dataPageElement });
        if (
          dataPageElement.result &&
          isAddressEqual(dataPageElement.result, address)
        ) {
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
