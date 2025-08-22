import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { candidate } = req.body;

  if (!candidate || candidate < 1 || candidate > 100) {
    return res.status(400).json({ error: "Invalid candidate" });
  }

  try {
    const connectedClient = await clientPromise;
    const db = connectedClient.db("votingApp");
    const collection = db.collection("candidates");

    const result = await collection.findOneAndUpdate(
      { candidate },
      { $inc: { votes: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    // handle if result.value is null
    if (!result.value) {
      return res.json({ success: true, candidate, votes: 1 });
    }

    return res.json({
      success: true,
      candidate: result.value.candidate,
      votes: result.value.votes,
    });
  } catch (error) {
    console.error("Vote API error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
