"use client";

import { SiteConfigContracts } from "@/config/site";
import { profileTokenAbi } from "@/contracts/abi/profile-token";
import useError from "@/hooks/useError";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { uploadJsonToIpfs } from "@/lib/ipfs";
import { ProfileTokenUriData } from "@/types/profile-token-uri-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zeroAddress } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ProfileEditForm(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { address } = useAccount();

  const { data: profileUri, isFetched: isProfileUriFetched } = useReadContract({
    address: contracts.profileToken,
    abi: profileTokenAbi,
    functionName: "getURI",
    args: [address || zeroAddress],
    chainId: contracts.chain.id,
  });
  const { data: profileUriData, isLoaded: isProfileUriDataLoaded } =
    useMetadataLoader<ProfileTokenUriData>(profileUri);

  if (
    profileUri == undefined ||
    !isProfileUriFetched ||
    !isProfileUriDataLoaded
  ) {
    return <Skeleton className="w-full h-8" />;
  }

  return <EditForm profileUriData={profileUriData} contracts={contracts} />;
}

function EditForm(props: {
  profileUriData: ProfileTokenUriData | undefined;
  contracts: SiteConfigContracts;
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const router = useRouter();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    image: z.string(),
    name: z.string(),
    bio: z.string(),
    tag: z.string(),
    telegram: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: props.profileUriData?.image || "",
      name: props.profileUriData?.name || "",
      bio: props.profileUriData?.bio || "",
      tag: props.profileUriData?.tag || undefined,
      telegram: props.profileUriData?.telegram || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);

      // Check public client
      if (!publicClient) {
        throw new Error("Public client is not ready");
      }
      // Check wallet
      if (!address || !walletClient) {
        throw new Error("Wallet is not connected");
      }
      // Check chain
      if (chainId !== props.contracts.chain.id) {
        throw new Error(`You need to connect to ${props.contracts.chain.name}`);
      }

      // Upload data to IPFS
      const profileUriData: ProfileTokenUriData = {
        image: values.image,
        name: values.name,
        bio: values.bio,
        tag: values.tag,
        telegram: values.telegram,
      };
      const profileUri = await uploadJsonToIpfs(profileUriData);

      // Send request to contract
      const txHash = await walletClient.writeContract({
        address: props.contracts.profileToken,
        abi: profileTokenAbi,
        functionName: "setURI",
        args: [profileUri],
        chain: props.contracts.chain,
      });
      await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Show success message
      toast({
        title: "Profile edited 👌",
      });
      router.push(`/${props.contracts.chain.id}/profiles`);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  placeholder="ipfs://..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Alice"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Adventure seeker..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="✈️ Travel">✈️ Travel</SelectItem>
                  <SelectItem value="🍝 Food">🍝 Food</SelectItem>
                  <SelectItem value="⚽ Sport">⚽ Sport</SelectItem>
                  <SelectItem value="📱 Technologies">
                    📱 Technologies
                  </SelectItem>
                  <SelectItem value="🚗 Cars">🚗 Cars</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telegram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://t.me..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isFormSubmitting}>
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save
        </Button>
      </form>
    </Form>
  );
}
