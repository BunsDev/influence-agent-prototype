import { ChainBadge } from "@/components/chain-badge";
import { Separator } from "@/components/ui/separator";

// TODO: Implement
export default function EditProfilePage({
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
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          That&apos;s how others will see you on the explore page
        </p>
      </div>
      <Separator className="my-6" />
    </div>
  );
}
