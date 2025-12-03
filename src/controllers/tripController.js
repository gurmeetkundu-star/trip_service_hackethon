import { TripModel } from "../models/tripModel.js";
import { publishTripUpdate } from "../services/mqttService.js";

export const TripController = {
  async getAll(req, res) {
    const data = await TripModel.getAll();
    res.json(data);
  },

  async get(req, res) {
    const data = await TripModel.getById(req.params.id);
    res.json(data);
  },

  async create(req, res) {
    const newTrip = await TripModel.create(req.body);
    res.status(201).json(newTrip);
  },

  async update(req, res) {
    const updatedTrip = await TripModel.update(req.params.id, req.body);
    publishTripUpdate(updatedTrip);
    res.json(updatedTrip);
  },

  async delete(req, res) {
    await TripModel.delete(req.params.id);
    res.json({ message: "Trip deleted" });
  }
};
