import express from 'express';
import joyasRoutes from './routes/joyas.js';
import logger from './middlewares/logger.js';
import 'dotenv/config';

const app = express();
const {PORT} = process.env || 3000;

app.use(express.json());
app.use(logger);
app.use("/joyas", joyasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
