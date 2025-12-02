import express from 'express';

import dotenv from 'dotenv';
import cors from 'cors';

import tripRoutes from './routes/tripRoutes.js';
import patchRoutes from './routes/patchRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Trip Service Running"));

app.use("/api/trips", tripRoutes);
app.use("/api/patch", patchRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
