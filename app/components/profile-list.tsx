"use client";

import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { useEffect, useState } from "react";
import EntityList from "./entity-list";
import { ProfileCard } from "./profile-card";
import { useAccount, useInfiniteReadContracts } from "wagmi";
import { profileTokenAbi } from "@/contracts/abi/profile-token";
import { isAddressEqual, zeroAddress } from "viem";

const LIMIT = 42;

export function ProfileList(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<string[] | undefined>();

  const { data } = useInfiniteReadContracts({
    cacheKey: `profile_list_${contracts.chain.id.toString()}`,
    contracts(pageParam) {
      return [...new Array(LIMIT)].map(
        (_, i) =>
          ({
            address: contracts.profileToken,
            abi: profileTokenAbi,
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
    setProfiles(undefined);
    if (data) {
      const profiles: string[] = [];
      const dataFirstPage = (data as any).pages[0];
      for (let i = 0; i < dataFirstPage.length; i++) {
        const dataPageElement = dataFirstPage[i];
        if (
          dataPageElement.result &&
          !isAddressEqual(dataPageElement.result, address || zeroAddress)
        ) {
          profiles.push(String(i));
        }
      }
      setProfiles(profiles);
    }
  }, [data, address]);

  return (
    <>
      <EntityList
        entities={profiles?.toReversed()}
        renderEntityCard={(profile, index) => (
          <ProfileCard key={index} profile={profile} contracts={contracts} />
        )}
        noEntitiesText={`No influencers on ${contracts.chain.name} 😐`}
        className="gap-6"
      />
    </>
  );
}
