import { SiteConfigContracts } from "@/config/site";
import { profileTokenAbi } from "@/contracts/abi/profile-token";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import { addressToShortAddress } from "@/lib/converters";
import { ProfileTokenUriData } from "@/types/profile-token-uri-data";
import Link from "next/link";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function ProfileCard(props: {
  profile: string;
  contracts: SiteConfigContracts;
}) {
  const { address } = useAccount();

  const { data: profileOwner, isFetched: isProfleOwnerFetched } =
    useReadContract({
      address: props.contracts.profileToken,
      abi: profileTokenAbi,
      functionName: "ownerOf",
      args: [BigInt(props.profile)],
      chainId: props.contracts.chain.id,
    });
  const { data: profileUri, isFetched: isProfleUriFetched } = useReadContract({
    address: props.contracts.profileToken,
    abi: profileTokenAbi,
    functionName: "tokenURI",
    args: [BigInt(props.profile)],
    chainId: props.contracts.chain.id,
  });
  const { data: profileUriData, isLoaded: isProfileUriDataLoaded } =
    useMetadataLoader<ProfileTokenUriData>(profileUri);

  if (
    !profileOwner ||
    !isProfleOwnerFetched ||
    !profileUri ||
    !isProfleUriFetched ||
    !profileUriData ||
    !isProfileUriDataLoaded
  ) {
    return <Skeleton className="w-full h-8" />;
  }

  return (
    <div className="w-full flex flex-row gap-4 border rounded px-6 py-8">
      {/* Icon */}
      <div>
        <Avatar className="size-14">
          <AvatarImage src={profileUriData.image} alt="Icon" />
          <AvatarFallback className="text-2xl bg-secondary-foreground">
            👤
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col items-start gap-2">
        {profileUriData.name && (
          <p className="text-xl font-bold">{profileUriData.name}</p>
        )}
        {profileUriData.tag && (
          <Badge variant="secondary" className="py-1.5 px-3">
            {profileUriData.tag}
          </Badge>
        )}
        {profileUriData.bio && (
          <p className="text-sm text-muted-foreground mt-1">
            {profileUriData.bio}
          </p>
        )}
        <div className="flex flex-row gap-4">
          <p className="text-sm">
            <a
              href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${profileOwner}`}
              target="_blank"
              className="underline underline-offset-4"
            >
              {addressToShortAddress(profileOwner)}
            </a>
          </p>
          {profileUriData.telegram && (
            <p className="text-sm">
              <a
                href={profileUriData.telegram}
                target="_blank"
                className="underline underline-offset-4"
              >
                Telegram
              </a>
            </p>
          )}
        </div>
        {isAddressEqual(profileOwner, address || zeroAddress) ? (
          <Link href={`/${props.contracts.chain.id}/profiles/edit`}>
            <Button variant="secondary" className="mt-2">
              Edit Profile
            </Button>
          </Link>
        ) : (
          <Link
            href={`/${props.contracts.chain.id}/offers/new/${profileOwner}`}
          >
            <Button variant="default" className="mt-2">
              Send Offer
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
