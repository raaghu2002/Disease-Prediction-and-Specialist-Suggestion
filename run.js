import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import {filter,filter2} from "./filter.js";


// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyBsnv9kdO-LEVfkiKuIO9HapDgUpFtU-3Y");

async function run(prompt) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return await filter2(filter(text))
}

export default run;
