import 'dotenv/config';
import { createApp } from './app';
import { MESSAGES } from './messages';

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(MESSAGES.server.listening(HOST, PORT));
});
