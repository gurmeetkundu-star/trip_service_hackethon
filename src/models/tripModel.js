import { pool } from "../config/db.js";

export const TripModel = {
  // -----------------------------------------
  // GET ALL TRIPS WITH STOPS + TASKS
  // -----------------------------------------
  async getAll() {
    const trips = await pool.query(`SELECT * FROM trip_table ORDER BY id DESC`);
    const tripRows = trips.rows;

    for (const trip of tripRows) {
      const stops = await pool.query(
        `SELECT * FROM stop_table WHERE trip_id = $1 ORDER BY sequence ASC`,
        [trip.id]
      );

      for (const stop of stops.rows) {
        const tasks = await pool.query(
          `SELECT * FROM task_table WHERE stop_id = $1 ORDER BY sequence ASC`,
          [stop.id]
        );
        stop.tasks = tasks.rows;
      }

      trip.stops = stops.rows;
    }

    return tripRows;
  },

  // -----------------------------------------
  // GET ONE TRIP BY ID
  // -----------------------------------------
  async getById(id) {
    const tripRes = await pool.query(`SELECT * FROM trip_table WHERE id = $1`, [id]);
    const trip = tripRes.rows[0];
    if (!trip) return null;

    const stops = await pool.query(
      `SELECT * FROM stop_table WHERE trip_id = $1 ORDER BY sequence ASC`,
      [trip.id]
    );

    for (const stop of stops.rows) {
      const tasks = await pool.query(
        `SELECT * FROM task_table WHERE stop_id = $1 ORDER BY sequence ASC`,
        [stop.id]
      );
      stop.tasks = tasks.rows;
    }

    trip.stops = stops.rows;

    return trip;
  },

  // -----------------------------------------
  // CREATE TRIP + STOPS + TASKS
  // -----------------------------------------
  async create(data) {
    const { expected_start_time, actual_start_time, status, stops } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert trip
      const tripResult = await client.query(
        `INSERT INTO trip_table (expected_start_time, actual_start_time, status)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [expected_start_time, actual_start_time, status]
      );

      const trip = tripResult.rows[0];

      // Insert stops
      for (const stop of stops) {
        const stopRes = await client.query(
          `INSERT INTO stop_table (trip_id, name, sequence)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [trip.id, stop.name, stop.sequence]
        );

        const stopId = stopRes.rows[0].id;

        // Insert tasks for this stop
        for (const task of stop.tasks) {
          await client.query(
            `INSERT INTO task_table (stop_id, task_type, sequence, task_name)
             VALUES ($1, $2, $3, $4)`,
            [stopId, task.task_type, task.sequence, task.task_name]
          );
        }
      }

      await client.query("COMMIT");
      return this.getById(trip.id);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  // -----------------------------------------
  // UPDATE TRIP (FULL REPLACE: stops + tasks)
  // -----------------------------------------
  async update(id, data) {
    const { expected_start_time, actual_start_time, status, stops } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update trip
      await client.query(
        `UPDATE trip_table SET
           expected_start_time=$1,
           actual_start_time=$2,
           status=$3
         WHERE id=$4`,
        [expected_start_time, actual_start_time, status, id]
      );

      // Delete old stops → tasks cascade automatically
      await client.query(`DELETE FROM stop_table WHERE trip_id=$1`, [id]);

      // Re-insert stops & tasks
      for (const stop of stops) {
        const stopRes = await client.query(
          `INSERT INTO stop_table (trip_id, name, sequence)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [id, stop.name, stop.sequence]
        );

        const stopId = stopRes.rows[0].id;

        for (const task of stop.tasks) {
          await client.query(
            `INSERT INTO task_table (stop_id, task_type, sequence, task_name)
             VALUES ($1, $2, $3, $4)`,
            [stopId, task.task_type, task.sequence, task.task_name]
          );
        }
      }

      await client.query("COMMIT");

      return this.getById(id);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  // -----------------------------------------
  // DELETE TRIP (CASCADE deletes stops + tasks)
  // -----------------------------------------
  async delete(id) {
    await pool.query(`DELETE FROM trip_table WHERE id=$1`, [id]);
    return true;
  }
};

