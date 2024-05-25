import { ProfileList } from "@/components/profile-list";
import { ChainBadge } from "@/components/chain-badge";
import { ProfilePersonalCard } from "@/components/profile-personal-card";
import { Separator } from "@/components/ui/separator";

export default function ProfilesPage({
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
        <h2 className="text-2xl font-bold tracking-tight">Explore</h2>
        <p className="text-muted-foreground">
          Influencers who can boost your marketing
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col gap-6">
        <ProfilePersonalCard chain={params.chain} />
        <ProfileList chain={params.chain} />
      </div>
    </div>
  );
}
