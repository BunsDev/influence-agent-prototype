import { InfluencerList } from "@/components/Influencer-list";
import { ChainBadge } from "@/components/chain-badge";
import { Separator } from "@/components/ui/separator";

export default function ExplorePage({ params }: { params: { chain: number } }) {
  return (
    <div className="container py-10 lg:px-80">
      <div className="mb-2">
        <ChainBadge chain={params.chain} />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Explore</h2>
        <p className="text-muted-foreground">
          Influencers who can boost your marketing
        </p>
      </div>
      <Separator className="my-6" />
      <InfluencerList />
    </div>
  );
}
