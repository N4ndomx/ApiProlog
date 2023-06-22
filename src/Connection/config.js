import {config} from 'dotenv';
config();

export default{
    port: process.env.port || 3000,
    dbUser: process.env.DB_USER,
    dbPort: process.env.DB_PORT,
    dbPassword: process.env.DB_PASSWORD,
    dbServer: process.env.DB_SERVER,
    dbDatabase: process.env.DB_DATABASE
}
