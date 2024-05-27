import { SiteConfigContracts } from "@/config/site";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAccount, useReadContract } from "wagmi";
import { Skeleton } from "./ui/skeleton";
import { offerTokenAbi } from "@/contracts/abi/offer-token";
import { addressToShortAddress } from "@/lib/converters";
import { OfferTokenUriData } from "@/types/offer-token-uri-data";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import { erc20Abi, formatEther, isAddressEqual, zeroAddress } from "viem";
import { OfferAcceptDialog } from "./offer-accept-dialog";
import { OfferCompleteDialog } from "./offer-complete-dialog";
import { OfferTokenCompleteDataUriData } from "@/types/offer-token-complete-data-uri-data";
import { OfferCloseDialog } from "./offer-close-dialog";

export function OfferCard(props: {
  offer: string;
  contracts: SiteConfigContracts;
}) {
  const { address } = useAccount();

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
  const { data: offerCompleteDataUriData } =
    useMetadataLoader<OfferTokenCompleteDataUriData>(
      offerContent?.completeDataURI || ""
    );

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
    | "UNKNOWN"
    | "AWAITING_ACCEPTANCE"
    | "AWAITING_COMPLETION"
    | "AWAITING_CLOSING"
    | "CLOSED_SUCCESSFULLY"
    | "CLOSED_FAILED" = "UNKNOWN";
  if (offerContent?.acceptDate?.toString() == "0") {
    offerStatus = "AWAITING_ACCEPTANCE";
  } else if (offerContent?.completeDate?.toString() == "0") {
    offerStatus = "AWAITING_COMPLETION";
  } else if (offerContent?.closeDate?.toString() == "0") {
    offerStatus = "AWAITING_CLOSING";
  } else if (offerContent?.closeSuccess == true) {
    offerStatus = "CLOSED_SUCCESSFULLY";
  } else if (offerContent?.closeSuccess == false) {
    offerStatus = "CLOSED_FAILED";
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
            {offerStatus == "UNKNOWN" && "❓"}
            {offerStatus == "AWAITING_ACCEPTANCE" && "🆕"}
            {offerStatus == "AWAITING_COMPLETION" && "🔥"}
            {offerStatus == "AWAITING_CLOSING" && "⌛"}
            {offerStatus == "CLOSED_SUCCESSFULLY" && "✅"}
            {offerStatus == "CLOSED_FAILED" && "❌"}
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
            {offerStatus == "UNKNOWN" && "Unknown Status"}
            {offerStatus == "AWAITING_ACCEPTANCE" && "Awaiting Acceptance"}
            {offerStatus == "AWAITING_COMPLETION" && "Awaiting Completion"}
            {offerStatus == "AWAITING_CLOSING" && "Awaiting Closing"}
            {offerStatus == "CLOSED_SUCCESSFULLY" && "Closed Successfully"}
            {offerStatus == "CLOSED_FAILED" && "Closed Failed"}
          </span>
        </p>
        <div className="flex flex-col gap-3">
          {/* Task */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Task:</p>
            <p className="text-sm">{offerUriData.task}</p>
          </div>
          {/* Recipient */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Influencer:</p>
            <p className="text-sm break-all">
              <a
                href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${offerContent.recipient}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                {addressToShortAddress(offerContent.recipient)}
              </a>
            </p>
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
          {/* Complete data */}
          {offerCompleteDataUriData?.telegramPostLink && (
            <div className="flex flex-col md:flex-row md:gap-3">
              <p className="text-sm text-muted-foreground">Telegram Post:</p>
              <p className="text-sm break-all">
                <a
                  href={offerCompleteDataUriData.telegramPostLink}
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  {offerCompleteDataUriData.telegramPostLink}
                </a>
              </p>
            </div>
          )}
        </div>
        {offerStatus === "AWAITING_ACCEPTANCE" &&
          address &&
          isAddressEqual(offerContent.recipient, address) && (
            <OfferAcceptDialog
              offer={props.offer}
              contracts={props.contracts}
              onAccept={() => refetchOfferContent()}
            />
          )}
        {offerStatus === "AWAITING_COMPLETION" &&
          address &&
          isAddressEqual(offerContent.recipient, address) && (
            <OfferCompleteDialog
              offer={props.offer}
              contracts={props.contracts}
              onComplete={() => refetchOfferContent()}
            />
          )}
        {offerStatus === "AWAITING_CLOSING" &&
          address &&
          isAddressEqual(offerContent.recipient, address) && (
            <OfferCloseDialog
              offer={props.offer}
              contracts={props.contracts}
              onClose={() => refetchOfferContent()}
            />
          )}
      </div>
    </div>
  );
}
