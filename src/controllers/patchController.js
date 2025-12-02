import { PatchModel } from "../models/patchModel.js";

export const createPatch = async (req, res) => {
    try {
        const patch = await PatchModel.create(req.body);
        res.status(201).json(patch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create patch" });
    }
};

export const getPatches = async (req, res) => {
    try {
        const patches = await PatchModel.getAll();
        res.status(200).json(patches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch patches" });
    }
};
