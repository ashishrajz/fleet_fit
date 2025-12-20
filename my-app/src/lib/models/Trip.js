import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ THIS WAS MISSING (CRITICAL)
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },

    status: {
      type: String,
      enum: ["assigned", "picked", "in_transit", "delivered"],
      default: "assigned",
    },

    co2Saved: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Trip ||
  mongoose.model("Trip", TripSchema);
