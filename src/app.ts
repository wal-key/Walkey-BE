import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
