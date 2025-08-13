// ws modülünü dahil ediyoruz (WebSocket sunucusu kurmak için)
const WebSocket = require('ws');

// 8080 portunda çalışan bir WebSocket sunucusu oluşturuyoruz
const wss = new WebSocket.Server({ port: 8080 });

// Bağlanan istemcileri (client) ve kullanıcı adlarını tutmak için Map
const clients = new Map();

// Yeni biri bağlandığında çalışacak olay
wss.on('connection', (ws) => {
    // Bu bağlantıya ait kullanıcı adı, başta null
    let username = null;

    // İstemciden bir mesaj geldiğinde çalışır
    ws.on('message', (data) => {
        try {
            // Gelen veriyi JSON formatına çeviriyoruz
            const msg = JSON.parse(data);

            // Kullanıcı giriş yapmaya çalışıyorsa
            if (msg.type === 'login') {
                username = msg.username; // Kullanıcı adını kaydet
                clients.set(ws, username); // Bu bağlantıyı listeye ekle
                console.log('[SERVER] ' + username + ' had join');
                // Hoş geldin mesajı gönder
                ws.send(JSON.stringify({ type: 'info', text: '[SERVER] Welcome,' + username }));

            // Kullanıcı mesaj göndermek istiyorsa
            } else if (msg.type === 'message') {
                // Eğer kullanıcı adı henüz ayarlanmamışsa uyarı gönder
                if (!username) {
                    ws.send(JSON.stringify({ type: 'info', text: '[WARNING] You have to enter an username before!' }));
                    return;
                }

                // Mesajı JSON formatında paketle
                const outgoing = JSON.stringify({
                    type: 'message',
                    username: username,
                    text: msg.text,
                });

                // Bağlı tüm istemcilere gönder (kendisi hariç)
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(outgoing);
                    }
                });
            }
        } catch (err) {
            // JSON parse hatası veya başka bir hata olursa logla
            console.error('[ERROR] ', err);
        }
    });

    // Bağlantı koptuğunda çalışır
    ws.on('close', () => {
        if (username) {
            console.log('[SERVER] ' + username + ' had leave the server');
            clients.delete(ws); // Listeden çıkar
        }
    });
});

// Sunucu başlatıldığında terminale bilgi yaz
console.log('[SERVER] Users can join');

