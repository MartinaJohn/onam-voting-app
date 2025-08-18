import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI; // stored in Vercel environment variables
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { candidate } = req.body;

  if (!candidate || candidate < 1 || candidate > 10) {
    return res.status(400).json({ error: "Invalid candidate" });
  }

  try {
    await client.connect();
    const db = client.db("votingApp");
    const collection = db.collection("candidates");

    const result = await collection.findOneAndUpdate(
      { candidate },
      { $inc: { votes: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    res.json({ success: true, candidate: result.value.candidate, votes: result.value.votes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await client.close();
  }
}
