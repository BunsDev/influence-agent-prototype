"use client";

import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { useState } from "react";
import EntityList from "./entity-list";
import { ProfileCard } from "./profile-card";

// TODO: Implement
export function ProfileList(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const [profiles, setProfiles] = useState<string[] | undefined>();

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
