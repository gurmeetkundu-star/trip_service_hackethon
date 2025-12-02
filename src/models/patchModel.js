import { pool } from "../config/db.js";

export const PatchModel = {
    async create(data) {
        const { type, content } = data;
        const result = await pool.query(
            `INSERT INTO patch_table (type, content) VALUES ($1, $2) RETURNING *`,
            [type, content]
        );
        return result.rows[0];
    },

    async getAll() {
        const result = await pool.query(`SELECT * FROM patch_table ORDER BY id DESC`);
        return result.rows;
    }
};
