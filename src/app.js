import express from 'express';
import prestamoRoutes from './routes/prestamo.routes.js';

const app = express();

app.use(express.json());
app.use('/api/', prestamoRoutes);

export default app;