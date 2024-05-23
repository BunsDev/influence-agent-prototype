import { ChainBadge } from "@/components/chain-badge";
import { Separator } from "@/components/ui/separator";

export default function SentOffersPage({
  params,
}: {
  params: { chain: number };
}) {
  return (
    <div className="container py-10 lg:px-80">
      <div className="mb-2">
        <ChainBadge chain={params.chain} />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Sent Offers</h2>
        <p className="text-muted-foreground">
          How influencer can help boost your marketing
        </p>
      </div>
      <Separator className="my-6" />
      {/* TODO: Implement */}
    </div>
  );
}
