// start express server
import express from 'express';
import { RegisterRoutes } from './routes/routes';
import dotenv from 'dotenv';
import { connectAvatarDB } from './providers/avatar.provider';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from '../public/swagger.json';
dotenv.config();

const app = express();
const PORT = 3000;

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// middleware to parse request body

app.use(express.json());
RegisterRoutes(app);
connectAvatarDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
})