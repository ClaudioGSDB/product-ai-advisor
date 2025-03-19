import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function validateBudget(productQuery: string, budget: number) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash",
		});
		const prompt = `
            I'm looking to buy: ${productQuery}
            My budget is: $${budget}
            
            Is this budget realistic for this product? Please respond with:
            - "REALISTIC" if the budget is reasonable
            - "LOW $minimumBudget" if the budget is too low (e.g., "LOW $800" means a minimum of $800 is needed)
            
            Only respond with one of these formats, nothing else.
        `;

		const result = await model.generateContent(prompt);
		const response = result.response.text();
		return response;
	} catch (error) {
		console.error("Budget validation error:", error);
		return "REALISTIC";
	}
}

export async function generateQuestions(productQuery: string, budget: number) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash", // Make sure you're using a valid model name
		});

		const prompt = `
        A user is looking to buy: ${productQuery}
        Their budget is: $${budget}
        
        Generate questions that would help determine the best product recommendation. 
        Ask as many questions as you deem necessary to fully understand the user's needs and preferences.
        However, be concise - only include questions that provide meaningful information for making a recommendation.
        
        These questions should:
        1. Focus on the most important parameters for this product category
        2. Help clarify the specific use case and requirements
        3. Cover different aspects (not redundant)
        4. Consider the budget constraints when generating questions
        5. Be sufficient to make a personalized recommendation that meets their specific needs
        
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
		// This handles cases where the model returns markdown code blocks or additional text
		const jsonMatch = response.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		} else {
			console.error("Could not extract JSON from response:", response);
			return ["FAILED"];
		}
	} catch (error) {
		console.error("Question generation error:", error);
		return ["FAILED"];
	}
}
