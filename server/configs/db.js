// configs/db.js
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

// Neon connection (DATABASE_URL ko .env me define karna hoga)
const sql = neon(process.env.DATABASE_URL);

export default sql;
