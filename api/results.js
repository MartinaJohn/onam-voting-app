import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await client.connect();
    const db = client.db("votingApp");
    const collection = db.collection("candidates");

    const results = await collection.find().toArray();

    res.json(results);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await client.close();
  }
}
