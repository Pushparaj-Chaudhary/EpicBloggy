import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './config/db.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import authRouter from './routes/authRoutes.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
app.get('/api/health', (req, res) => {
  res.send('Server is alive');
});

await connectDB();

// Seed Admin User
const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const exists = await User.findOne({ email: adminEmail });
        if (!exists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log("Admin user seeded.");
        }
    } catch (error) {
        console.error("Error seeding admin: ", error);
    }
};
await seedAdmin();

// Security Setup
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // 100 reqs per IP
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});

const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, 
    message: { success: false, message: "Too many attempts from this IP, please try again in an hour." }
});

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Apply global window limit
app.use('/api/', limiter);
// Apply strict limit for Auth and AI calls
app.use('/api/auth/', strictLimiter);
app.use('/api/blog/generate', strictLimiter);

// Routes
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/admin', adminRouter);
app.use('/api/blog', blogRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;