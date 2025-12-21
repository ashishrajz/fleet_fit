import mongoose from "mongoose";

const ShipmentSchema = new mongoose.Schema(
  {
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weight: Number,
    volume: Number,
    boxes: Number,

    source: String,
    destination: String,
    pickup: Date,
    deadline: Date,

    status: {
      type: String,
      enum: [
        "created",
        "requested",
        "approved",
        "picked",
        "in_transit",
        "delivered",
      ],
      default: "created",
    },

    assignedTruck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
    },

    co2Saved: Number,
    costSaved: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Shipment ||
  mongoose.model("Shipment", ShipmentSchema);
