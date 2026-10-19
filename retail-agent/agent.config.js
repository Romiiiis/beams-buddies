/**
 * Retail AI Agent — Central Config
 * Stack: Retell AI (voice agent) + Twilio (phone) + n8n (workflows)
 */

require("dotenv").config();

const config = {
  // ─── Retell AI ──────────────────────────────────────────────────────────────
  retell: {
    apiKey: process.env.RETELL_API_KEY,
    agentId: process.env.RETELL_AGENT_ID,
    webhookSecret: process.env.RETELL_WEBHOOK_SECRET, // for verifying Retell → n8n payloads
    baseUrl: "https://api.retellai.com",
  },

  // ─── Twilio ─────────────────────────────────────────────────────────────────
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER, // must be imported into Retell
  },

  // ─── n8n Webhooks ───────────────────────────────────────────────────────────
  n8n: {
    base: process.env.N8N_WEBHOOK_BASE_URL,

    // Retell fires this when a call starts (good for logging, CRM lookups)
    callStarted: `${process.env.N8N_WEBHOOK_BASE_URL}/${process.env.N8N_CALL_STARTED_WEBHOOK}`,

    // Retell fires this when a call ends — includes full transcript + recording
    callEnded: `${process.env.N8N_WEBHOOK_BASE_URL}/${process.env.N8N_CALL_ENDED_WEBHOOK}`,

    // Only needed if you're using n8n as Retell's custom LLM endpoint
    customLlm: `${process.env.N8N_WEBHOOK_BASE_URL}/${process.env.N8N_CUSTOM_LLM_WEBHOOK}`,
  },

  // ─── Agent Identity ──────────────────────────────────────────────────────────
  agent: {
    name: process.env.AGENT_NAME || "Alex",
    storeName: process.env.AGENT_STORE_NAME || "the store",
  },
};

function validate() {
  const required = [
    ["RETELL_API_KEY", config.retell.apiKey],
    ["RETELL_AGENT_ID", config.retell.agentId],
    ["TWILIO_ACCOUNT_SID", config.twilio.accountSid],
    ["TWILIO_AUTH_TOKEN", config.twilio.authToken],
    ["TWILIO_PHONE_NUMBER", config.twilio.phoneNumber],
    ["N8N_WEBHOOK_BASE_URL", config.n8n.base],
  ];

  const missing = required.filter(([, val]) => !val).map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}\nSee .env.example`);
  }
}

module.exports = { config, validate };
