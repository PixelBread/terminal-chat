// WebSocket kütüphanesini dahil et
const WebSocket = require('ws'); 

// Terminal üzerinden kullanıcıdan giriş almak için readline modülünü dahil et
const readline = require('readline');

// readline arayüzünü başlat
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});     

// Kullanıcıdan bir kullanıcı adı isteme
rl.question('[SERVER] Please enter your username: ', (username) => {
  
  // Sunucuya bağlan (ws://localhost:8080)
  const ws = new WebSocket('ws://localhost:8080');

  // Sunucuya bağlanıldığında çalışacak
  ws.on('open', () => {
    console.log('[SERVER] Welcome, ' + username);

    // Sunucuya "login" tipinde kullanıcı adını gönder
    ws.send(JSON.stringify({ type: 'login', username }));

    // Terminalden her satır girildiğinde çalışır
    rl.on('line', (input) => {
      const message = input.trim(); // boşlukları sil
      if (message === '') { // eğer boş mesaj ise atla
        rl.prompt();
        return;
      }
      // Mesajı sunucuya gönder
      ws.send(JSON.stringify({ type: 'message', text: message }));
      rl.prompt();
    }); 
  });   

  // Sunucudan mesaj geldiğinde çalışır
  ws.on('message', (data) => {
    const msg = JSON.parse(data); // JSON verisini objeye çevir
    if (msg.type === 'message') {
      // Eğer mesajı gönderen kişi biz değilsek ekrana yaz
      if (msg.username !== username) {
        process.stdout.clearLine(); // aktif satırı temizle
        process.stdout.cursorTo(0); // satır başına git
        console.log(`${msg.username}: ${msg.text}`);
        rl.prompt(true); // tekrar giriş bekle
      } 
    } else if (msg.type === 'info') {
      // info tipindeki mesajlar burada işlenebilir
    }   
  });   

  // Sunucu kapandığında çalışır
  ws.on('close', () => {
    console.log('[SERVER] Server just turned off');
    process.exit();
  });   

  // Herhangi bir hata olduğunda çalışır
  ws.on('error', (err) => {
    console.log('[ERROR] ', err.message);
    process.exit();
  });
});

