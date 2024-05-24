import { errorToPrettyError } from "@/lib/errors";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  result: "success" | "fail" | { error: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const { tokenUri, tokenCompleteDataUri } = req.query;
    /**
     * TODO: Implement
     * - Load task using tokenURI
     * - Load link using tokenCompletedDataURI
     * - If link from Telegram, then load post content using Telegram API
     * - Check that post content fulfill the task using OpenAI
     * - Return "confirmed" if everything is ok, otherwise "not_confirmed"
     */
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log({ tokenUri, tokenCompleteDataUri });
    res.status(200).json({ result: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ result: { error: errorToPrettyError(error).message } });
  }
}
