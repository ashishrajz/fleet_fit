import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ✅ COMPOUND UNIQUE INDEX
RatingSchema.index({ trip: 1, from: 1 }, { unique: true });

export default mongoose.models.Rating ||
  mongoose.model("Rating", RatingSchema);
