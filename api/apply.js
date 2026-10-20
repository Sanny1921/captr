// CAPTR creator-application endpoint.
// Receives the join form as JSON (images already compressed to JPEG base64
// by the browser) and emails it to the agency inbox via Mailjet's Send API.
// Secrets live only in Vercel env vars (MJ_API_KEY, MJ_SECRET, SENDER_EMAIL).
const AGENCY_EMAIL = "captrmarketingagency@gmail.com";

const LABELS = [
  ["name", "Name"],
  ["instagram", "Instagram handle"],
  ["ig_link", "Instagram profile link"],
  ["other_platforms", "Other platforms"],
  ["followers", "Current followers"],
  ["avg_views", "Average views (last 30 days)"],
  ["engagement", "Engagement rate"],
  ["content_type", "Content type"],
  ["city", "City"],
  ["languages", "Languages"],
  ["collabs", "Past brand collaborations"],
  ["whatsapp", "WhatsApp"],
  ["email", "Email"]
];

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

function okB64(s) {
  return typeof s === "string" && /^[A-Za-z0-9+/=\r\n]+$/.test(s) && s.length < 6 * 1024 * 1024;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    const b = req.body || {};
    // Honeypot: real users never fill the hidden "website" field.
    if (typeof b.website === "string" && b.website.trim()) return res.json({ ok: true });
    // Speed trap: humans take more than a couple of seconds.
    if (typeof b.elapsed_s !== "number" || b.elapsed_s < 3) return res.status(400).json({ error: "too_fast" });

    const required = ["name", "instagram", "followers", "content_type", "city", "whatsapp", "email", "consent"];
    for (const k of required) {
      if (!String(b[k] == null ? "" : b[k]).trim()) return res.status(400).json({ error: "missing_" + k });
    }
    if (!b.insights_file || !okB64(b.insights_file.data)) return res.status(400).json({ error: "missing_insights" });

    const attachments = [{ name: String(b.insights_file.name || "insights.jpg").slice(0, 80), content: b.insights_file.data }];
    if (b.demographics_file && okB64(b.demographics_file.data)) {
      attachments.push({ name: String(b.demographics_file.name || "demographics.jpg").slice(0, 80), content: b.demographics_file.data });
    }

    const rows = LABELS.map(function (pair) {
      const v = esc(b[pair[0]]).trim();
      return '<tr><td style="padding:6px 10px;border:1px solid #ddd;color:#555">' + pair[1] +
        '</td><td style="padding:6px 10px;border:1px solid #ddd">' + (v || "-") + "</td></tr>";
    }).join("");

    const html =
      '<h2 style="font-family:Arial,sans-serif">New creator application: ' + esc(b.name) + "</h2>" +
      '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' + rows + "</table>" +
      '<p style="font-family:Arial,sans-serif;color:#555">Last-30-days insights screenshot attached' +
      (attachments.length > 1 ? " (plus a demographics screenshot)" : "") +
      ". The creator agreed to be contacted on WhatsApp or email.</p>";

    const auth = Buffer.from(process.env.MJ_API_KEY + ":" + process.env.MJ_SECRET).toString("base64");
    const r = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: { authorization: "Basic " + auth, "content-type": "application/json" },
      body: JSON.stringify({
        Messages: [{
          From: { Email: process.env.SENDER_EMAIL, Name: "CAPTR Website" },
          To: [{ Email: AGENCY_EMAIL, Name: "CAPTR" }],
          ReplyTo: { Email: String(b.email).slice(0, 120), Name: String(b.name).slice(0, 120) },
          Subject: "New creator application: " + String(b.name).slice(0, 80) + " (" + String(b.instagram).slice(0, 60) + ")",
          HTMLPart: html,
          Attachments: attachments.map(function (a) {
            return { ContentType: "image/jpeg", Filename: a.name, Base64Content: a.content };
          })
        }]
      })
    });
    if (!r.ok) {
      console.error("mailjet_error", r.status, await r.text());
      return res.status(502).json({ error: "send_failed" });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error("apply_error", e);
    return res.status(500).json({ error: "server_error" });
  }
}
