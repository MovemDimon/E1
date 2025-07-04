import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { userId } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channel  = process.env.TELEGRAM_CHANNEL;

  try {
    const resp = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channel}&user_id=${userId}`
    );
    const data = await resp.json();
    const ok = data.ok && ['member', 'creator', 'administrator'].includes(data.result.status);
    res.json({ ok });
  } catch {
    res.status(500).json({ ok: false });
  }
}
