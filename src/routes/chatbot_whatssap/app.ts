import { FastifyInstance } from "fastify";
// import { client } from "../../lib/bot_whatssap";
export class BotQRcode {
  async getQRcode(fastify: FastifyInstance) {
    let code = "";
    fastify.get("/Qrcode", async (req, res) => {
      // client.on("qr", (qr) => {
      //   console.log(qr);
      //   // Generate and scan this code with your phone
      //   code = qr;
      //   console.log("QR RECEIVED", qr);
      // });
      return { QRcode: code };
    });
  }
  async signOut(fastify: FastifyInstance) {
    let code = "";
    fastify.get("/logout", async (req, res) => {
      // const result = await client.logout();
      // return { result };
    });
  }
}
