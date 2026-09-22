import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function esc(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(iso: string | Date | null): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const payment = await db.payment.findUnique({ where: { id } }).catch(() => null);

  // Pull studio branding from settings (best-effort).
  const settingsRows = await db.setting.findMany().catch(() => []);
  const settings: Record<string, string> = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  const studioName = settings.studioName || "Arcwave Pilates";
  const tagline = settings.tagline || "Reformer · Mat · Movement";
  const address =
    settings.location || "Arcwave Pilates Studio · India";
  const phone = settings.phone || "";
  const email = settings.email || "";
  const instagramHandle = settings.instagramHandle || "@arcwavepilates";

  const customerName = payment?.customerName || "—";
  const customerEmail = payment?.customerEmail || "";
  const customerPhone = payment?.customerPhone || "—";
  const amount = payment ? formatINR(payment.amount) : "—";
  const currency = payment?.currency || "INR";
  const status = payment?.status || "—";
  const gateway = payment?.gateway || "—";
  const txnId = payment?.gatewayTxnId || payment?.id || "—";
  const invoiceNo = payment?.id ? `ARW-${payment.id.slice(-6).toUpperCase()}` : "—";
  const createdAt = payment ? formatDate(payment.createdAt) : "—";
  const notes = payment?.notes || "";

  if (!payment) {
    const notFoundHtml = `<!doctype html><html><head><meta charset="utf-8"/>
      <title>Receipt not found — ${esc(studioName)}</title></head>
      <body style="font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #152f3e;">
        <h2>Receipt not found</h2>
        <p>No payment record matches this ID.</p>
      </body></html>`;
    return new NextResponse(notFoundHtml, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const statusColor =
    status === "success"
      ? "#21665e"
      : status === "pending"
        ? "#b08200"
        : status === "failed" || status === "cancelled"
          ? "#b3261e"
          : "#152f3e";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Receipt ${esc(invoiceNo)} — ${esc(studioName)}</title>
<style>
  :root {
    --paper: #f6f4ed;
    --white: #fffefa;
    --ink: #152f3e;
    --teal: #21665e;
    --lime: #dce7b5;
    --line: #d9ded5;
    --muted: #5c696b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Almarai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--paper);
    color: var(--ink);
  }
  .page {
    max-width: 720px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  }
  .receipt {
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 32px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.02);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--line);
  }
  .brand .logo {
    width: 54px;
    height: 54px;
    border-radius: 9999px;
    object-fit: cover;
    border: 1px solid var(--line);
  }
  .brand h1 {
    margin: 0;
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 26px;
    font-weight: 400;
    letter-spacing: 0.01em;
    color: var(--ink);
  }
  .brand .tagline {
    margin: 4px 0 0;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--teal);
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin: 24px 0;
    gap: 16px;
  }
  .head .label {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .head .invoice {
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 30px;
    line-height: 1;
    color: var(--ink);
  }
  .head .status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${statusColor};
    background: ${statusColor}1A;
    border: 1px solid ${statusColor}33;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin: 8px 0 22px;
  }
  .grid .item .label {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .grid .item .value {
    font-size: 14px;
    color: var(--ink);
    word-break: break-word;
  }
  .divider {
    border: 0;
    border-top: 1px dashed var(--line);
    margin: 24px 0;
  }
  .total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    background: var(--lime);
    border-radius: 14px;
  }
  .total .label {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .total .amount {
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 32px;
    color: var(--ink);
    line-height: 1;
  }
  .footer {
    margin-top: 26px;
    text-align: center;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
  }
  .footer .name {
    color: var(--ink);
    font-weight: 600;
    letter-spacing: 0.06em;
  }
  .actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 24px 0 8px;
  }
  .btn {
    appearance: none;
    cursor: pointer;
    border: 1px solid var(--teal);
    background: var(--teal);
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    padding: 12px 24px;
    border-radius: 999px;
    transition: opacity 0.15s;
  }
  .btn:hover { opacity: 0.92; }
  .btn.ghost {
    background: transparent;
    color: var(--teal);
  }
  @media print {
    body { background: #fff; }
    .actions { display: none; }
    .receipt { border: none; box-shadow: none; padding: 0; }
    .page { padding: 0; max-width: none; }
  }
  @media (max-width: 480px) {
    .page { padding: 16px 12px 32px; }
    .receipt { padding: 20px; }
    .brand h1 { font-size: 22px; }
    .head .invoice { font-size: 22px; }
    .grid { grid-template-columns: 1fr; gap: 12px; }
  }
</style>
</head>
<body>
  <main class="page">
    <div class="actions">
      <button class="btn" onclick="window.print()">Print receipt</button>
      <button class="btn ghost" onclick="window.close()">Close</button>
    </div>

    <article class="receipt">
      <header class="brand">
        <img class="logo" src="/images/arcwave-01.png" alt="${esc(studioName)} logo" />
        <div>
          <h1>${esc(studioName)}</h1>
          <p class="tagline">${esc(tagline)}</p>
        </div>
      </header>

      <div class="head">
        <div>
          <p class="label">Invoice no.</p>
          <p class="invoice">${esc(invoiceNo)}</p>
        </div>
        <div style="text-align: right;">
          <p class="label">Status</p>
          <span class="status"><span class="dot"></span>${esc(status)}</span>
        </div>
      </div>

      <section class="grid">
        <div class="item">
          <p class="label">Billed to</p>
          <p class="value">${esc(customerName)}<br/>${esc(customerPhone)}${customerEmail ? "<br/>" + esc(customerEmail) : ""}</p>
        </div>
        <div class="item">
          <p class="label">Date</p>
          <p class="value">${esc(createdAt)}</p>
        </div>
        <div class="item">
          <p class="label">Transaction ID</p>
          <p class="value">${esc(txnId)}</p>
        </div>
        <div class="item">
          <p class="label">Payment method</p>
          <p class="value">${esc(gateway)} · ${esc(currency)}</p>
        </div>
      </section>

      <hr class="divider" />

      <div class="grid">
        <div class="item">
          <p class="label">Description</p>
          <p class="value">${
            notes
              ? esc(notes)
              : "Pilates session / membership payment"
          }</p>
        </div>
      </div>

      <div class="total">
        <span class="label">Total paid</span>
        <span class="amount">${esc(amount)}</span>
      </div>

      <footer class="footer">
        <p class="name">${esc(studioName)}</p>
        <p>${esc(address)}</p>
        <p>
          ${phone ? esc(phone) : ""}${phone && email ? " · " : ""}${email ? esc(email) : ""}
          ${phone || email ? " · " : ""}${esc(instagramHandle)}
        </p>
        <p style="margin-top: 8px; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;">
          Thank you for moving with us.
        </p>
      </footer>
    </article>
  </main>
  <script>
    // If opened in a new tab from an admin "Print" link, give it a beat then prompt print.
    // (Don't auto-print on load — annoying for keyboard users.)
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
