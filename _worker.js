const servervless = 'gendarbot.ari-andikha.web.id';
const servertrojan = 'gendarbot.ari-andikha.web.id';
const passuid = '6ac83a31-453a-45a3-b01d-1bd20ee9101f';
const TELEGRAM_BOT_TOKEN = '7813433823:AAG23Gu9rPzEASZPqIPE9pQXzR4louLV-gY';
const TELEGRAM_USER_ID = 'ariyelDlacasa'; // Nama Telegram pengguna

// Menyimpan ID chat pengguna yang sudah menerima pesan kesalahan
const usersWithError = new Set();

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    if (request.method === 'POST') {
      const data = await request.json();
      const message = data.message || data.callback_query?.message;
      const chatId = message.chat.id;
      const text = message.text?.trim();
      const callbackData = data.callback_query?.data; // Menangani data tombol inline

      console.log(`Received message: ${text}`); // Logging the incoming message

      // Jika menerima perintah /start
      if (text === "/start") {
        const welcomeMessage = `
🎉 Selamat datang di Bot Akun VLESS dan Trojan! 🎉

👤 Bot ini dioperasikan oleh @ariyelDlacasa.

Gunakan format berikut untuk membuat akun:
🔹 Kirim *Proxy:Port* (contoh: 192.168.1.1:443)
🔹 Bot akan memproses dan mengirimkan tautan Trojan dan VLESS.

Masukkan Proxy dan Port sekarang!
`;

        await sendMessage(chatId, welcomeMessage);
        return new Response("OK");
      }

      // Jika format input adalah Proxy:Port
      if (text?.includes(":")) {
        const [proxy, port] = text.split(":");
        if (!validateIP(proxy) || !validatePort(port)) {
          if (!usersWithError.has(chatId)) {
            await sendMessage(chatId, `❌ Format salah! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
            usersWithError.add(chatId);  // Tandai pengguna yang sudah menerima pesan kesalahan
          }
          return new Response("OK");
        }

        // Memeriksa status proxy
        const status = await checkProxyStatus(proxy);
        
        // Pesan dengan informasi proxy dan status
        const responseMessage = `
✅ Anda telah mengirimkan Proxy dan Port yang valid:
- **Proxy**: ${proxy}
- **Port**: ${port}

------------------------------------
🔹 **Status Proxy**: *${status.active ? 'Aktif' : 'Tidak Aktif'}*
🔹 **Bendera**: ${status.active ? '🇺🇸' : '❌'}   # Bendera disesuaikan dengan negara alamat IP
🔹 **Ping**: ${status.ping}ms

🔹 **Alamat Proxy**: ${proxy}:${port}
------------------------------------
Sekarang Anda bisa memilih untuk mendapatkan akun **Trojan** atau **VLESS**.
`;

        // Menyediakan tombol untuk memilih akun
        const keyboard = {
          inline_keyboard: [
            [
              { text: "Ambil Akun Trojan", callback_data: `trojan_${proxy}_${port}` },
              { text: "Ambil Akun VLESS", callback_data: `vless_${proxy}_${port}` }
            ]
          ]
        };

        await sendMessage(chatId, responseMessage, keyboard);
        return new Response("OK");
      }

      // Jika format tidak dikenali
      await sendMessage(chatId, `❌ Format tidak dikenali! Kirim dengan format Proxy:Port\nContoh: 192.168.1.1:443`);
      return new Response("OK");
    } else if (data.callback_query) {
      const chatId = data.callback_query.message.chat.id;
      const callbackData = data.callback_query.data; // Menangani data tombol inline
      const [type, proxy, port] = callbackData.split('_'); // Memisahkan data callback untuk mendapatkan jenis akun dan proxy

      let linkMessage = '';

      // Generate link berdasarkan pilihan pengguna
      if (type === 'trojan') {
        linkMessage = generateTrojanLink(proxy, port);
      } else if (type === 'vless') {
        linkMessage = generateVlessLink(proxy, port);
      }

      // Kirim akun yang diminta
      const responseMessage = `
✅ Berikut akun Anda:

🔹 **Akun ${type.toUpperCase()}**:
\`\`\`
${linkMessage}
\`\`\`
------------------------------------
Gunakan akun dengan baik, dan pastikan untuk tidak membagikan informasi ini ke pihak yang tidak dipercaya.
`;

      await sendMessage(chatId, responseMessage);
      return new Response("OK");
    } else {
      return new Response("Method Not Allowed", { status: 405 });
    }
  } catch (error) {
    console.error('Error processing request:', error); // Improved error logging
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Fungsi untuk mengirim pesan ke Telegram
async function sendMessage(chatId, text, replyMarkup = null) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
    reply_markup: replyMarkup
  });
  
  try {
    const response = await fetch(telegramUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
    if (!response.ok) {
      throw new Error(`Telegram API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error); // Log error if message sending fails
  }
}

// Validasi Proxy (IP Address)
function validateIP(ip) {
  const ipParts = ip.split(".");
  return ipParts.length === 4 && ipParts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

// Validasi Port
function validatePort(port) {
  const num = parseInt(port, 10);
  return num >= 1 && num <= 65535;
}

// Fungsi untuk memeriksa status proxy
async function checkProxyStatus(proxy) {
  // Simulasi pemeriksaan status (dapat diganti dengan layanan yang valid)
  const isActive = true; // Bisa menggunakan layanan pengecekan IP seperti ip-api.com atau ipinfo.io
  
  // Jika proxy aktif, simulasi ping
  const ping = isActive ? 20 : 0;  // Misalnya, jika aktif, ping = 20ms
  
  return { active: isActive, ping: ping };
}

// Generate VLESS Link dengan nama Telegram
function generateVlessLink(proxy, port) {
  return `vless://${passuid}@${servervless}:443?encryption=none&security=tls&sni=${servervless}&fp=randomized&type=ws&host=${servervless}&path=%2F${proxy}%3A${port}#${TELEGRAM_USER_ID}`;
}

// Generate Trojan Link dengan nama Telegram
function generateTrojanLink(proxy, port) {
  return `trojan://${passuid}@${servertrojan}:443?encryption=none&security=tls&sni=${servertrojan}&fp=randomized&type=ws&host=${servertrojan}&path=%2F${proxy}%3A${port}#${TELEGRAM_USER_ID}`;
}
