// Loopback-only SMTP receiver for end-to-end email tests. Never forwards mail.
const net = require("node:net");
module.exports = async function smtpFixture() {
  const messages = [];
  const sockets = new Set();
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => {});
    socket.setEncoding("utf8");
    socket.write("220 localhost test SMTP\r\n");
    let pending = "",
      data = null,
      recipient = "",
      authStage = 0;
    socket.on("data", (chunk) => {
      pending += chunk;
      while (pending.includes("\r\n")) {
        const end = pending.indexOf("\r\n");
        const line = pending.slice(0, end);
        pending = pending.slice(end + 2);
        if (data !== null) {
          if (line === ".") {
            const raw = data.join("\r\n");
            const body = raw.slice(raw.indexOf("\r\n\r\n") + 4);
            const decoded = /Content-Transfer-Encoding: base64/i.test(raw)
              ? Buffer.from(body.replace(/\s/g, ""), "base64").toString("utf8")
              : body
                  .replace(/=\r\n/g, "")
                  .replace(/=([0-9a-f]{2})/gi, (_, code) =>
                    String.fromCharCode(parseInt(code, 16)),
                  );
            messages.push({
              recipient,
              raw,
              token: decoded.match(/token=([a-f0-9]{64})/)?.[1],
            });
            data = null;
            socket.write("250 2.0.0 Message accepted\r\n");
          } else data.push(line.startsWith("..") ? line.slice(1) : line);
          continue;
        }
        if (authStage) {
          if (authStage++ === 1) socket.write("334 UGFzc3dvcmQ6\r\n");
          else {
            authStage = 0;
            socket.write("235 2.7.0 Authentication successful\r\n");
          }
        } else if (/^(EHLO|HELO)/i.test(line))
          socket.write("250-localhost\r\n250 AUTH PLAIN LOGIN\r\n");
        else if (/^AUTH LOGIN/i.test(line)) {
          authStage = 1;
          socket.write("334 VXNlcm5hbWU6\r\n");
        } else if (/^AUTH PLAIN/i.test(line))
          socket.write("235 2.7.0 Authentication successful\r\n");
        else if (/^RCPT TO:/i.test(line)) {
          recipient = line.match(/<([^>]+)>/)?.[1] || "";
          socket.write("250 OK\r\n");
        } else if (/^DATA$/i.test(line)) {
          data = [];
          socket.write("354 End with dot\r\n");
        } else if (/^QUIT$/i.test(line)) socket.end("221 Bye\r\n");
        else socket.write("250 OK\r\n");
      }
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    port: server.address().port,
    messages,
    close: () =>
      new Promise((resolve) => {
        for (const socket of sockets) socket.destroy();
        server.close(resolve);
      }),
  };
};
