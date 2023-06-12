import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";
import { Message } from "../../types/types";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, name, message } = req.body;
    if (
      !email ||
      !email.includes("@") ||
      !name ||
      name.trim() === "" ||
      !message ||
      message.trim() === ""
    ) {
      res.status(422).json({ message: "Invalid input." });
      return;
    }
    // Store it in a database
    const newMessage: Message = {
      email,
      name,
      message,
    };

    let client: MongoClient;
    try {
      client = await MongoClient.connect(process.env.MONGO_URI);
    } catch (error) {
      res.status(500).json({ message: "Could not connect to database." });
      return;
    }

    const db = client.db();

    try {
      const result = await db.collection("messages").insertOne(newMessage);
      newMessage._id = result.insertedId;
      console.log(result);
    } catch (error) {
      client.close();
      res.status(500).json({ message: "Storing message failed!" });
      return;
    }

    client.close();

    res.status(201).json({
      message: "Successfully stored message!",
      outgoingMessage: newMessage,
    });
  }
}

export default handler;
