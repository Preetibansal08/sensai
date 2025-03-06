import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "sentechAi",
  name: "sentechAi",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});
