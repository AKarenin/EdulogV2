import axios from "axios";

// Configuration for direct OpenAI API interaction
const OPENAI_API_KEY = "sk-proj-zxyoDnJbZjAr6Teo2WRaT3BlbkFJPE8M8nArlAwQf70Y6iuO"; // Replace with your OpenAI API key
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Configuration for backend API interaction (Vercel)
const BACKEND_API_URL = "https://fastapi-app-70974974592.asia-northeast3.run.app"; // Adjust if deployed at a different path or domain

/**
 * Sends a user message to the OpenAI API or the backend API (via Flask/Supabase).
 * 
 * @param {string} userMessage - The message or question from the user.
 * @param {boolean} useBackend - Whether to route the request to the backend (`true`) or directly to OpenAI (`false`).
 * @returns {Promise<string>} The response from OpenAI or the backend API.
 */
export const chatWithGPT = async (userMessage, useBackend = true) => {
  try {
    // Validate the user message
    if (!userMessage || userMessage.trim() === "") {
      throw new Error("Message cannot be empty");
    }

    // Use the backend API (Flask + Supabase) if `useBackend` is true
    if (useBackend) {
      const response = await axios.post(BACKEND_API_URL, { question: userMessage });

      // Handle responses that might be in plain text or JSON
      if (typeof response.data === "string") {
        return response.data; // If plain text, return as is
      }

      if (response.data && response.data.answer) {
        return response.data.answer; // Extract and return the answer if JSON
      }

      throw new Error("Unexpected response format from the backend");
    }

    // Directly call OpenAI API if `useBackend` is false
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Use the retrieval-augmented generation (RAG) prompt pattern to provide answers. Context may include external knowledge provided in a structured format.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    // Handle OpenAI response, ensuring compatibility with plain text or JSON
    if (response.data && response.data.choices) {
      return response.data.choices[0].message.content; // Extract and return the GPT response
    }

    throw new Error("Unexpected response format from OpenAI API");
  } catch (error) {
    console.error("Error communicating with ChatGPT:", error.response?.data || error.message);

    // Handle known errors from the backend or OpenAI API
    if (error.response) {
      const errorMessage = error.response.data.error || "An unknown error occurred";
      return `Error: ${errorMessage}`;
    }

    // Fallback for unexpected errors
    return "Sorry, something went wrong. Please try again.";
  }
};
