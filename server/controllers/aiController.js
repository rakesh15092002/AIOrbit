import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data"; // <-- add this at top

// Initialize OpenAI client (but using Gemini API as backend)
const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY, // Gemini API key stored in .env
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", // Gemini endpoint
});

// Controller function to generate an article
export const generateArticle = async (req, res) => {
  try {
    // 1. Get current userId from Clerk
    const { userId } = req.auth();

    // 2. Extract input from request body
    const { prompt, length } = req.body;

    // 3. Get plan and usage info from middleware (already attached in req)
    const plan = req.plan;
    const free_usage = req.free_usage;

    // 4. Check usage limit for free users
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }
    console.log("hello1");
    // 5. Send request to Gemini model (chat completion API)
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash", // Chosen Gemini model
      messages: [
        {
          role: "user",
          content: prompt, // Use the user's actual prompt instead of fixed text
        },
      ],
      temperature: 0.7, // Controls creativity of the response
      max_tokens: length, // Limit the response length
    });
    console.log("hello2");

    // 6. Extract AI-generated content
    const content = response.choices[0].message.content;
    console.log("hello");

    // 7. Save the creation in database
    await sql`
      INSERT INTO creations(user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;
    console.log("hello3");
    // 8. If user is free, increase their usage count by 1
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    // 9. Send back the generated content to frontend
    res.json({ success: true, content });
  } catch (error) {
    // 10. Handle errors gracefully
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller function to generate an article
export const generateBlogTitle = async (req, res) => {
  try {
    // 1. Get current userId from Clerk
    const { userId } = req.auth();

    // 2. Extract input from request body
    const { prompt } = req.body;

    // 3. Get plan and usage info from middleware (already attached in req)
    const plan = req.plan;
    const free_usage = req.free_usage;

    // 4. Check usage limit for free users
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }
    console.log("hello1");
    // 5. Send request to Gemini model (chat completion API)
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash", // Chosen Gemini model
      messages: [
        {
          role: "user",
          content: prompt, // Use the user's actual prompt instead of fixed text
        },
      ],
      temperature: 0.7, // Controls creativity of the response
      max_tokens: 100, // Limit the response length
    });

    // 6. Extract AI-generated content
    const content = response.choices[0].message.content;

    // 7. Save the creation in database
    await sql`
      INSERT INTO creations(user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    // 8. If user is free, increase their usage count by 1
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    // 9. Send back the generated content to frontend
    res.json({ success: true, content });
  } catch (error) {
    // 10. Handle errors gracefully
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // Build form data
    const formData = new FormData();
    formData.append("prompt", prompt);

    console.log("➡️ Before API call");

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1", // correct endpoint
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    console.log("✅ After API call, got response");

    const base64Image = `data:image/png;base64,${Buffer.from(data).toString(
      "base64"
    )}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: "creations",
    });

    await sql`
      INSERT INTO creations(user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("❌ Error in generateImage:");
    console.error("Message:", error.message);
    console.error("Response:", error.response?.status, error.response?.data);
    res.json({ success: false, message: error.message });
  }
};
