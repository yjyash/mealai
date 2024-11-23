import mongoose from "mongoose";

const shoppingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  nutritionalInfo: {
    calories: { type: Number, required: true },
    carbs: { type: Number, required: true },
    protein: { type: Number, required: true },
    fats: { type: Number, required: true },
    fiber: { type: Number, required: true },
  },
  recipe: { type: String, required: true },
  ingredientsUsed: { type: [String], required: true },
  cuisineType: { type: String, required: true },
});

const Shopping = mongoose.model("Shopping", shoppingSchema);

export default Shopping;
