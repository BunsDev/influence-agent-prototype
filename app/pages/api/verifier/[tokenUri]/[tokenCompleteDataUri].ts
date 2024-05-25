import { errorToPrettyError } from "@/lib/errors";
import type { NextApiRequest, NextApiResponse } from "next";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import axios from "axios";
import { OfferTokenUriData } from "@/types/offer-token-uri-data";
import { OfferTokenCompleteDataUriData } from "@/types/offer-token-complete-data-uri-data";

type ResponseData = {
  result: "success" | "fail" | { error: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const { tokenUri, tokenCompleteDataUri } = req.query;
    // TODO: Uncomment
    // const isSuccess = await isTaskCompletedSuccessfully(
    //   tokenUri as string,
    //   tokenCompleteDataUri as string
    // );
    const isSuccess = true;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ result: isSuccess ? "success" : "fail" });
  } catch (error) {
    res
      .status(500)
      .json({ result: { error: errorToPrettyError(error).message } });
  }
}

async function isTaskCompletedSuccessfully(
  tokenUri: string,
  tokenCompleteDataUri: string
): Promise<boolean> {
  // TODO: Load data using input URIs
  const tokenUriData: OfferTokenUriData = {
    task: "Make a post mentioning the SuperCat project",
  };
  const tokenCompleteDataUriData: OfferTokenCompleteDataUriData = {
    telegramPostLink: "https://t.me/mscculture/21840",
  };
  if (tokenUriData.task && tokenCompleteDataUriData.telegramPostLink) {
    const { message: telegramPostMessage, date: telegramPostDate } =
      await getTelegramPostMessage(tokenCompleteDataUriData.telegramPostLink);

    return await isPostMatchTask(
      tokenUriData.task,
      telegramPostMessage,
      telegramPostDate
    );
  }
  throw new Error("Specified data is not supported");
}

async function getTelegramPostMessage(
  postLink: string
): Promise<{ message: string; date: number }> {
  // Parse post
  const postUrl = new URL(postLink);
  const postUrlSegments = postUrl.pathname.split("/");
  const postChannel = postUrlSegments[1];
  const postId = Number(postUrlSegments[2]);
  // Init client
  const client = new TelegramClient(
    new StringSession(process.env.TELEGRAM_STRING_SESSION),
    Number(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH as string,
    {}
  );
  await client.connect();
  // Send request
  const response = (await client.invoke(
    new Api.channels.GetMessages({
      channel: postChannel,
      id: [postId as any],
    })
  )) as Api.messages.Messages;
  // Parse response
  let message = "";
  let date = 0;
  if (response.messages[0] instanceof Api.Message) {
    message = response.messages[0].message;
    date = response.messages[0].date;
  }
  return { message, date };
}

// TODO: Use post date to check the post
async function isPostMatchTask(
  task: string,
  postMessage: string,
  postDate: number
): Promise<boolean> {
  try {
    const messages = [
      {
        role: "user",
        content: `
          I sent the next task to a influencer:
          "
          ${task}
          "
          The influencer made the next post:
          "
          ${postMessage}
          "
          Give an answer that contains ONLY ONE number. Where the number is the percentage of how well the post matches the task.
          Double-check that your answer contains only one number.
        `,
      },
    ];
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.0,
      },
      { headers: { Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}` } }
    );
    const response = JSON.parse(
      JSON.stringify(data?.choices?.[0]?.message?.content)
    );
    if (Number(response) >= 25) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(errorToPrettyError(error).message);
    return false;
  }
}
