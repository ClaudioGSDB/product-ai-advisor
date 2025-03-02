// src/services/ai-service/ai-service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeUserQuery, validateProductBudget } from "../product-service";

const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export async function validateBudget(productQuery: string, budget: number) {
	try {
		// Use our product service to check if budget is realistic
		const validation = await validateProductBudget(productQuery, budget);

		if (!validation.isRealistic) {
			return `LOW $${validation.suggestedMinimum}`;
		}

		return "REALISTIC";
	} catch (error) {
		console.error("Budget validation error:", error);
		return "REALISTIC"; // Fallback to avoid blocking the flow
	}
}

export async function generateQuestions(productQuery: string, budget: number) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-pro",
		});

		// First analyze the query with our product service
		const queryAnalysis = await analyzeUserQuery(productQuery, budget);

		// Use the suggested questions from our analysis when available
		if (
			queryAnalysis.suggestedQuestions &&
			queryAnalysis.suggestedQuestions.length > 0
		) {
			// Convert suggested questions into the format we need
			return queryAnalysis.suggestedQuestions.map((question) => {
				// Default to multiple choice type
				const questionObj: any = {
					question,
					type: "multiple_choice",
				};

				// Determine question type and options based on the question content
				if (
					question.toLowerCase().includes("how much") ||
					question.toLowerCase().includes("how many")
				) {
					questionObj.type = "open_ended";
				} else if (
					question.toLowerCase().includes("do you") ||
					question.toLowerCase().includes("are you") ||
					question.toLowerCase().includes("would you")
				) {
					questionObj.type = "boolean";
				} else {
					// Generate appropriate options based on the question
					questionObj.options = generateOptionsForQuestion(
						question,
						queryAnalysis.category
					);
				}

				return questionObj;
			});
		}

		// If our analysis didn't provide good questions, fall back to AI generation
		const prompt = `
      A user is looking to buy: ${productQuery}
      Their budget is: $${budget}
      
      Generate 1-3 questions that would help determine the best product recommendation. 
      Only include questions that are necessary - if you already have enough information to make a good recommendation, include fewer questions.
      These questions should:
      1. Focus on the most important parameters for this product category
      2. Help clarify the specific use case and requirements
      3. Cover different aspects (not redundant)
      4. Consider the budget constraints when generating questions
      
      Format your response as a JSON array of objects with 'question' and 'type' fields.
      The 'type' should be one of: 'multiple_choice', 'open_ended', or 'boolean'.
      For multiple_choice, include an 'options' array.
      
      Example:
      [
        {
          "question": "What type of games will you primarily play?",
          "type": "multiple_choice",
          "options": ["AAA titles with high graphics", "Competitive esports", "Casual gaming", "Game development"]
        }
      ]
      
      Return ONLY the JSON array, with no markdown formatting, no backticks, and no explanations.
    `;

		const result = await model.generateContent(prompt);
		const response = result.response.text();

		// Extract JSON from the response
		const jsonMatch = response.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		} else {
			console.error("Could not extract JSON from response:", response);
			return [];
		}
	} catch (error) {
		console.error("Question generation error:", error);
		return [];
	}
}

// Helper function to generate appropriate options based on question content
function generateOptionsForQuestion(
	question: string,
	category: string
): string[] {
	if (
		question.toLowerCase().includes("use") ||
		question.toLowerCase().includes("purpose")
	) {
		// Computer/laptop use case options
		if (category === "Computers") {
			return [
				"Everyday browsing and office work",
				"Gaming",
				"Video/photo editing",
				"Programming/development",
				"Business/professional use",
			];
		}
		// Phone use case options
		else if (
			category === "Electronics" &&
			question.toLowerCase().includes("phone")
		) {
			return [
				"Social media and communication",
				"Photography and video",
				"Gaming",
				"Business/professional use",
				"Basic usage (calls, texts, light apps)",
			];
		}
	}

	if (question.toLowerCase().includes("coffee")) {
		if (question.toLowerCase().includes("type")) {
			return [
				"Drip coffee maker",
				"Espresso machine",
				"Single-serve pod machine",
				"French press",
				"Pour-over system",
			];
		}
		if (
			question.toLowerCase().includes("cups") ||
			question.toLowerCase().includes("brew")
		) {
			return [
				"Just for myself (1-2 cups)",
				"Small household (3-4 cups)",
				"Family size (5-10 cups)",
				"Large quantity (10+ cups)",
			];
		}
	}

	if (
		category === "Computers" &&
		question.toLowerCase().includes("storage")
	) {
		return [
			"256GB SSD",
			"512GB SSD",
			"1TB SSD",
			"1TB HDD",
			"Combination of SSD and HDD",
		];
	}

	if (category === "Computers" && question.toLowerCase().includes("RAM")) {
		return ["4GB", "8GB", "16GB", "32GB or more"];
	}

	// Default options for generic questions
	return ["Option 1", "Option 2", "Option 3", "Option 4"];
}
