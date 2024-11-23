import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios';
import Shopping from '../modals/shopping.js';
import express from 'express';
import mongoose from 'mongoose'; // Add this line
import { log } from 'console';
import { isLogin } from '../middlewares/middleware.js';
import User from '../modals/user.modal.js';


dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = express.Router();
const upload = multer({ dest: '../uploads/' });

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString('base64'),
            mimeType,
        },
    };
}

router.get('/',isLogin, async (req, res) => {
  try {
    
    
    // const userId = req.user._id;
    const userId = '673da3fb35fa54d5ae4b325a';
    console.log(userId);

    // const user = await User.findById(userId);
    // console.log(user);
    
    // if (!user) {
    //   console.log("user not exist");
    //   return res.status(404).json({ message: 'User not found' });
    // }
      
    

    // Ensure that the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find dishes based on the userId
    const dishes = await Shopping.find({ user: new mongoose.Types.ObjectId(userId) });
    console.log(dishes);
    
    if (dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found for this user' });
    }

    // Return the found dishes
    res.json({ message: 'Dishes found successfully', data: dishes });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

router.post("/", upload.array("images"),async (req, res) => {
  try { 
    // console.log(req.files);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Based on the provided images of vegetables, generate a list of two dishes that can be prepared using these ingredients. Provide the response in the following exact JSON structure as an array of objects, where each object represents a dish:

      [
        {
          "name": "<Dish Name>",
          "nutritionalInfo": {
            "calories": <Total Calories in kcal>,
            "carbs": <Total Carbohydrates in grams>,
            "protein": <Total Protein in grams>,
            "fats": <Total Fats in grams>,
            "fiber": <Total Dietary Fiber in grams>
          },
          "recipe": "<Step-by-step preparation instructions>",
          "ingredientsUsed": ["<Ingredient 1>", "<Ingredient 2>", "<Ingredient 3>"],
          "cuisineType": "<Cuisine Type (e.g., Indian, Italian, Mexican)>"
        }
      ]

      Ensure the response contains only the JSON array and no additional text or explanations.
    `;
    console.log(req.files);
    
    const imageParts = req.files.map((file) =>
      fileToGenerativePart(file.path, "image/jpeg")
    );

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = await response.text();

  
    req.files.forEach((file) => fs.unlinkSync(file.path));

    let sanitizedText = text.trim();
    // console.log(sanitizedText);
    

    sanitizedText = sanitizedText.replace(/`/g, ''); 
     sanitizedText = text.trim().replace('json', '');
    sanitizedText = sanitizedText.replace(/^\s*[\`\']*\s*|\s*[\`\']*\s*$/g, ''); 

      // console.log("Sanitized Text After Cleaning:", sanitizedText); 
    
      
// console.log(sanitizedText);

    
const dishes = JSON.parse(sanitizedText);


    
  let userId = '673da3fb35fa54d5ae4b325a';
    // userId = new mongoose.Types.ObjectId(userId);
    // console.log(userId);
    
    
    // const item = await Shopping.findOne({ user: userId });
    // console.log(item);
    
    

      await Shopping.deleteMany({ user: new mongoose.Types.ObjectId(userId) });
    const savedDishes = await Promise.all(
      dishes.map((dish) =>
        new  Shopping({
          user: new mongoose.Types.ObjectId(userId),
          name: dish.name,
          nutritionalInfo: dish.nutritionalInfo,
          recipe: dish.recipe,
          ingredientsUsed: dish.ingredientsUsed,
          cuisineType: dish.cuisineType,
        }).save()
      )
    );

    res.json({ message: "Dishes saved successfully", data: savedDishes });
  } catch (error) {
    console.error("Error generating shopping list:", error);
    res.status(500).json({ error: "Failed to generate shopping list" });
  }
});




export default router;