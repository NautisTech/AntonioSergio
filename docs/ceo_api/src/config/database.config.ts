import { registerAs } from '@nestjs/config';
import 'dotenv/config';

export default registerAs('database', () => ({
    main: {
        server: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ? process.env.DB_PORT : '1433', 10) || 1433,
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_MAIN_NAME || 'CEO_Main',
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
        },
    },
}));