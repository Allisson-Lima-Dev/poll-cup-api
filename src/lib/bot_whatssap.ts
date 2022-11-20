import { Client, LocalAuth, NoAuth } from "whatsapp-web.js";

export const client = new Client({
  authStrategy: new NoAuth(),
});
