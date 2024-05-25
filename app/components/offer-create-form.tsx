"use client";

import useError from "@/hooks/useError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";
import { offerTokenAbi } from "@/contracts/abi/offer-token";
import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { erc20Abi, isAddress, maxUint256, parseEther } from "viem";
import { OfferTokenUriData } from "@/types/offer-token-uri-data";
import { uploadJsonToIpfs } from "@/lib/ipfs";

export function OfferCreateForm(props: {
  recipient: `0x${string}`;
  chain: number;
}) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const router = useRouter();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    recipient: z.string().length(42),
    task: z.string(),
    paymentAmount: z.coerce.number().gt(0),
    paymentToken: z.string().length(42),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: props.recipient,
      task: "",
      paymentAmount: 0,
      paymentToken: "",
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
      if (chainId !== contracts.chain.id) {
        throw new Error(`You need to connect to ${contracts.chain.name}`);
      }

      // Parse values
      let recipient;
      if (!isAddress(values.recipient)) {
        throw new Error("Recipient address is incorrect");
      } else {
        recipient = values.recipient as `0x${string}`;
      }
      let paymentToken;
      if (!isAddress(values.paymentToken)) {
        throw new Error("Payment token address is incorrect");
      } else {
        paymentToken = values.paymentToken as `0x${string}`;
      }
      let paymentAmount = parseEther(String(values.paymentAmount));

      // Upload data to IPFS
      const offerUriData: OfferTokenUriData = {
        task: values.task,
        created: new Date().getTime(),
      };
      const offerUri = await uploadJsonToIpfs(offerUriData);

      // Send request to approve payment token transfer
      const { request: approveRequest } = await publicClient.simulateContract({
        address: paymentToken,
        abi: erc20Abi,
        functionName: "approve",
        args: [contracts.offerToken, maxUint256],
        chain: contracts.chain,
        account: address,
      });
      const approveTxHash = await walletClient.writeContract(approveRequest);
      await publicClient.waitForTransactionReceipt({
        hash: approveTxHash,
      });

      // Send request to to create offer
      const txHash = await walletClient.writeContract({
        address: contracts.offerToken,
        abi: offerTokenAbi,
        functionName: "create",
        args: [recipient, paymentAmount, paymentToken, offerUri],
        chain: contracts.chain,
      });
      await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Show success message
      toast({
        title: "Offer sent 👌",
      });
      router.push(`/${contracts.chain.id}/offers/sent`);
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
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Influencer</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x0000000000000000000000000000000000000000"
                  disabled={true}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="task"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Make a Telegram post about our new product that will be displayed for more than 24 hours..."
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
          name="paymentAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="320"
                  type="number"
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
          name="paymentToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Token</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x0000000000000000000000000000000000000000"
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
          Send
        </Button>
      </form>
    </Form>
  );
}
