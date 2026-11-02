import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AccessToken } from "livekit-server-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  throw new Error("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured");
}

// Issue LiveKit JWT tokens for Deaf Users, Interpreters, and Guests
app.post("/api/token", async (req: Request, res: Response) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res
        .status(400)
        .json({ error: "roomName and participantName are required" });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      ttl: "1h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return res.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    return res.status(500).json({ error: "Failed to generate LiveKit token" });
  }
});

app.listen(PORT, () => {
  console.log(`LiveKit Token Backend running on http://localhost:${PORT}`);
});
