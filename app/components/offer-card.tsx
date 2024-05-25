import { SiteConfigContracts } from "@/config/site";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useReadContract } from "wagmi";
import { Skeleton } from "./ui/skeleton";
import { offerTokenAbi } from "@/contracts/abi/offer-token";
import { addressToShortAddress } from "@/lib/converters";
import { OfferTokenUriData } from "@/types/offer-token-uri-data";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import { erc20Abi, formatEther, zeroAddress } from "viem";

export function OfferCard(props: {
  offer: string;
  contracts: SiteConfigContracts;
}) {
  /**
   * Define offer data
   */
  const { data: offerOwner, isFetched: isOfferOwnerFetched } = useReadContract({
    address: props.contracts.offerToken,
    abi: offerTokenAbi,
    functionName: "ownerOf",
    args: [BigInt(props.offer)],
    chainId: props.contracts.chain.id,
  });
  const {
    data: offerContent,
    isFetched: isOfferContentFetched,
    refetch: refetchOfferContent,
  } = useReadContract({
    address: props.contracts.offerToken,
    abi: offerTokenAbi,
    functionName: "getContent",
    args: [BigInt(props.offer)],
    chainId: props.contracts.chain.id,
  });
  const {
    data: offerUri,
    isFetched: isOfferUriFetched,
    refetch: refetchOfferUri,
  } = useReadContract({
    address: props.contracts.offerToken,
    abi: offerTokenAbi,
    functionName: "tokenURI",
    args: [BigInt(props.offer)],
    chainId: props.contracts.chain.id,
  });
  const { data: offerUriData, isLoaded: isOfferUriDataLoaded } =
    useMetadataLoader<OfferTokenUriData>(offerUri);

  /**
   * Define offer payment token symbol
   */
  const {
    data: offerPaymentTokenSymbol,
    isFetched: isOfferPaymentTokenSymbolFetched,
  } = useReadContract({
    address: offerContent?.paymentToken || zeroAddress,
    abi: erc20Abi,
    functionName: "symbol",
    chainId: props.contracts.chain.id,
  });

  /**
   * Define offer status
   */
  let offerStatus:
    | "UNKOWN"
    | "NEW"
    | "ACCEPTED"
    | "AWAITING_CLOSING"
    | "CLOSED_SUCCESSFULLY"
    | "FAILED" = "UNKOWN";
  if (offerContent?.acceptDate?.toString() == "0") {
    offerStatus = "NEW";
  } else if (offerContent?.completeDate?.toString() == "0") {
    offerStatus = "ACCEPTED";
  } else if (offerContent?.closeDate?.toString() == "0") {
    offerStatus = "AWAITING_CLOSING";
  } else if (offerContent?.closeSuccess == true) {
    offerStatus = "CLOSED_SUCCESSFULLY";
  } else if (offerContent?.closeSuccess == false) {
    offerStatus = "FAILED";
  }

  if (
    !isOfferOwnerFetched ||
    !offerOwner ||
    !isOfferContentFetched ||
    !offerContent ||
    !isOfferUriFetched ||
    !isOfferUriDataLoaded ||
    !offerUriData ||
    !offerPaymentTokenSymbol ||
    !isOfferPaymentTokenSymbolFetched
  ) {
    return <Skeleton className="w-full h-8" />;
  }

  return (
    <div className="w-full flex flex-row gap-4 border rounded px-6 py-8">
      {/* Icon */}
      <div>
        <Avatar className="size-14">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-2xl bg-secondary-foreground">
            {offerStatus == "UNKOWN" && "❓"}
            {offerStatus == "NEW" && "✨"}
            {offerStatus == "ACCEPTED" && "🔥"}
            {offerStatus == "AWAITING_CLOSING" && "⌛"}
            {offerStatus == "CLOSED_SUCCESSFULLY" && "✅"}
            {offerStatus == "FAILED" && "❌"}
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col items-start gap-4">
        {/* Number and status */}
        <p className="text-xl font-bold">
          Offer #{props.offer}
          <span className="font-normal text-muted-foreground">
            {" — "}
            {offerStatus == "UNKOWN" && "Unknown Status"}
            {offerStatus == "NEW" && "New"}
            {offerStatus == "ACCEPTED" && "Accepted"}
            {offerStatus == "AWAITING_CLOSING" && "Awaiting Closing"}
            {offerStatus == "CLOSED_SUCCESSFULLY" && "Closed Successfully"}
            {offerStatus == "FAILED" && "Failed"}
          </span>
        </p>
        <div className="flex flex-col gap-3">
          {/* Task */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Task:</p>
            <p className="text-sm">{offerUriData.task}</p>
          </div>
          {/* Owner */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Sender:</p>
            <p className="text-sm break-all">
              <a
                href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${offerOwner}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                {addressToShortAddress(offerOwner)}
              </a>
            </p>
          </div>
          {/* Created */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Sent:</p>
            <p className="text-sm break-all">
              {new Date(offerUriData.created || 0).toLocaleString()}
            </p>
          </div>
          {/* Payment */}
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Payment:</p>
            <p className="text-sm break-all">
              {formatEther(BigInt(offerContent.paymentAmount || 0))}{" "}
              {offerPaymentTokenSymbol}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
