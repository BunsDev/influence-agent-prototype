"use client";

import { profileTokenAbi } from "@/contracts/abi/profile-token";
import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { useAccount, useReadContract } from "wagmi";
import { Skeleton } from "./ui/skeleton";
import { ProfileCard } from "./profile-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { addressToShortAddress } from "@/lib/converters";
import { Button } from "./ui/button";
import Link from "next/link";

export function ProfilePersonalCard(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { address } = useAccount();

  const { data: profile, isFetched: isProfleFetched } = useReadContract({
    address: contracts.profileToken,
    abi: profileTokenAbi,
    functionName: "getTokenId",
    args: [address as `0x${string}`],
    chainId: contracts.chain.id,
  });

  console.log({ profile });

  if (!address) {
    return null;
  }

  if (profile == undefined || !isProfleFetched) {
    return <Skeleton className="w-full h-8" />;
  }

  if (profile != BigInt(0)) {
    return <ProfileCard profile={profile.toString()} contracts={contracts} />;
  }

  return (
    <div className="w-full flex flex-row gap-4 border rounded px-6 py-8">
      {/* Icon */}
      <div>
        <Avatar className="size-14">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-2xl bg-secondary-foreground">
            👤
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col items-start gap-4">
        <p className="text-base font-bold">
          <a
            href={`${contracts.chain.blockExplorers?.default?.url}/address/${address}`}
            target="_blank"
            className="underline underline-offset-4"
          >
            {addressToShortAddress(address)}
          </a>
        </p>
        <Link href={`/${props.chain}/profiles/edit`}>
          <Button>Edit Profile</Button>
        </Link>
      </div>
    </div>
  );
}
