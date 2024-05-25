import { errorToPrettyError } from "@/lib/errors";
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

type ResponseData = {
  result: string | { error: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Send request to auth to telegram
    const client = new TelegramClient(
      new StringSession(""),
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH as string,
      {}
    );
    await client.start({
      botAuthToken: process.env.TELEGRAM_BOT_TOKEN as string,
    });
    const session: any = client.session.save();
    // Return
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ result: session });
  } catch (error) {
    res
      .status(500)
      .json({ result: { error: errorToPrettyError(error).message } });
  }
}
