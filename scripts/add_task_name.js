import { pool } from '../src/config/db.js';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Add task_name to task_table');
        await client.query('BEGIN');

        // Check if column exists to avoid errors on re-run
        const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='task_table' AND column_name='task_name'
    `);

        if (checkRes.rows.length === 0) {
            await client.query(`ALTER TABLE task_table ADD COLUMN task_name VARCHAR(255)`);
            console.log('Added task_name column.');
        } else {
            console.log('Column task_name already exists.');
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
