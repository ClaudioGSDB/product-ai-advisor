import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { query, budget, messages } = body;

		// Initialize the model with system prompt
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-pro",
			systemInstruction: `You are an Amazon product advisor that helps users find the perfect products based on their needs. 
      
      Your responsibilities:
      1. Ask clarifying questions to understand the user's specific needs and use cases.
      2. Consider the user's budget constraints when making recommendations.
      3. Identify the key features and specifications that would be important for their use case.
      4. Provide thoughtful analysis about what makes a good product in this category.
      
      When you need more information, ask ONE specific question at a time to understand their needs better.
      If providing options, format them as a numbered list (1., 2., etc.).
      
      When you have enough information, explain what kind of products would be suitable and why, focusing on the specifications that matter most for their needs.
      
      Do not make up specific product names, models, or prices since you'll later be connected to a live Amazon product database.`,
		});

		let result;

		if (messages && messages.length > 0) {
			// Define message type
			interface Message {
				role: "user" | "assistant";
				content: string;
			}

			// This is a follow-up conversation with history
			const chat = model.startChat();

			// We need to get the last user message to send to the chat
			const lastUserMessage = messages
				.filter((message: Message) => message.role === "user")
				.pop();

			if (!lastUserMessage) {
				return NextResponse.json(
					{ error: "No user message found" },
					{ status: 400 }
				);
			}

			// Send the last user message to the chat with context from previous messages
			result = await chat.sendMessage(lastUserMessage.content);
			result = await result.response;
		} else if (query) {
			// This is the initial query
			const userMessage = budget
				? `I am looking for ${query} within a budget of $${budget}`
				: `I am looking for ${query}`;

			// Generate content for the initial query
			result = await model.generateContent(userMessage);
			result = await result.response;
		} else {
			return NextResponse.json(
				{ error: "Either query or messages must be provided" },
				{ status: 400 }
			);
		}

		const text = result.text();
		return NextResponse.json({ response: text });
	} catch (error: any) {
		console.error("Error calling Gemini API:", error);
		return NextResponse.json(
			{ error: error.message || "An error occurred" },
			{ status: 500 }
		);
	}
}
