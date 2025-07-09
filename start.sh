#!/bin/bash

echo "🚀 Iniciando servidor Node.js..."
node server.js & 
SERVER_PID=$!
sleep 2

echo "🌐 Iniciando Ngrok na porta 8088..."
ngrok http 8088 > /dev/null & 
sleep 3

NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o 'https://[a-zA-Z0-9\-]*\.ngrok-free\.app' | head -n 1)
if [ -z "$NGROK_URL" ]; then
  echo "❌ Não foi possível capturar a URL do Ngrok."
  kill $SERVER_PID
  exit 1
fi

echo "✅ URL Ngrok: $NGROK_URL"
sed -i "s|https://SEU_NGROK_URL.ngrok-free.app|$NGROK_URL|g" index.html
echo "📄 index.html atualizado com sucesso!"
echo "🌍 Acesse o index.html no navegador para iniciar o teste."
