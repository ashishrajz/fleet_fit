import mongoose from "mongoose";

const TruckSchema = new mongoose.Schema(
  {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    truckType: {
      type: String,
      enum: ["Mini Truck", "Pickup", "Container","Trailer"],
      required: true,
    },

    maxWeight: {
      type: Number,
      required: true,
    },

    maxVolume: {
      type: Number,
      required: true,
    },

    routes: [
      {
        source: String,
        destination: String,
      },
    ],

    costPerKm: {
      type: Number,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Truck ||
  mongoose.model("Truck", TruckSchema);
