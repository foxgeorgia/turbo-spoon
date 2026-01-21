import express from "express";
import cors from "cors";
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { google } from "googleapis";
import OpenAI from "openai";

// https://turbo-spoon-szcy.onrender.com/

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

function makeOAuthClient() {
   const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

   if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI");
   }

   return new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
   );
}

// Google sign in
app.get("/auth/google", (req, res) => {
   const oauth2Client = makeOAuthClient();

   const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
         "https://www.googleapis.com/auth/gmail.readonly"
      ],
   });

   res.redirect(url);
});

// Google redirects
app.get("/auth/google/callback", async (req, res) => {
   const code = req.query.code;
   if (!code) return res.status(400).send("Missing code");

   const oauth2Client = makeOAuthClient();

   try {
      const { tokens } = await oauth2Client.getToken(code);

      // console.log("REFRESH TOKEN:", tokens.refresh_token);

      res.json({
         ok: true,
         message: "OAuth succeeded. Tokens received.",
         gotRefreshToken: Boolean(tokens.refresh_token),
         tokenInfo: {
            scope: tokens.scope,
            token_type: tokens.token_type,
            expiry_date: tokens.expiry_date,
         },
      });
   } catch (err) {
      console.error(err);
      res.status(500).send("OAuth token exchange failed");
   }
});

function makeAuthedOAuthClient() {
   const { GOOGLE_REFRESH_TOKEN } = process.env;
   if (!GOOGLE_REFRESH_TOKEN) throw new Error("Missing GOOGLE_REFRESH_TOKEN");

   const oauth2Client = makeOAuthClient();
   oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
   return oauth2Client;
}

app.get("/api/emails/recent", async (req, res) => {
   try {
      const auth = makeAuthedOAuthClient();
      const gmail = google.gmail({ version: "v1", auth });

      const list = await gmail.users.messages.list({
         userId: "me",
         maxResults: 5,
         q: "newer_than:2d",
      });

      const ids = list.data.messages?.map(m => m.id).filter(Boolean) ?? [];

      const results = [];
      for (const id of ids) {
         const msg = await gmail.users.messages.get({
            userId: "me",
            id,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
         });

         const headers = msg.data.payload?.headers ?? [];
         const getHeader = (name) => headers.find(h => h.name === name)?.value ?? "";

         results.push({
            id,
            from: getHeader("From"),
            subject: getHeader("Subject"),
            date: getHeader("Date"),
            snippet: msg.data.snippet ?? "",
         });
      }

      res.json({ ok: true, emails: results });
   } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: String(err?.message ?? err) });
   }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/summarize", async (req, res) => {
   try {
      const { subject, from, body } = req.body || {};

      if (!body) {
         return res.status(400).json({ ok: false, error: "Missing `body`" });
      }

      const input = `
         You are summarizing an email for a feed UI.

         From: ${from ?? "(unknown)"}
         Subject: ${subject ?? "(no subject)"}

         Email body:
            ${body}`.trim();

      const response = await openai.responses.create({
         model: "gpt-5.2",
         input,
         instructions:
            "Return JSON with keys: summary (1-2 sentences), action_items (array of strings), needs_reply (boolean).",
      });

      const text = response.output_text;

      // If the model returns JSON text, parse it; otherwise return raw.
      let parsed;
      try {
         parsed = JSON.parse(text);
      } catch {
         parsed = { summary: text };
      }

      return res.json({ ok: true, ...parsed });
   } catch (err) {
      console.error("summarize error:", err);
      return res.status(500).json({ ok: false, error: "Summarization failed" });
   }
});

// Serve the frontend
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, '../frontend/dist')))

app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
