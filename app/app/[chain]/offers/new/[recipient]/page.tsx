import { ChainBadge } from "@/components/chain-badge";
import { OfferCreateForm } from "@/components/offer-create-form";
import { Separator } from "@/components/ui/separator";

export default function NewOfferPage({
  params,
}: {
  params: { chain: number; recipient: `0x${string}` };
}) {
  return (
    <div className="container py-10 lg:px-80">
      <div className="mb-2">
        <ChainBadge chain={params.chain} />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">New Offer</h2>
        <p className="text-muted-foreground">
          How the influencer can help you boost marketing
        </p>
      </div>
      <Separator className="my-6" />
      <OfferCreateForm recipient={params.recipient} chain={params.chain} />
    </div>
  );
}
