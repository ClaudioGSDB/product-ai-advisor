import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function validateBudget(productQuery: string, budget: number) {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-2.0-flash-lite",
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
			model: "gemini-2.0-flash-lite",
		});

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
            
            Return ONLY the JSON, nothing else.
      `;

		const result = await model.generateContent(prompt);
		const response = result.response.text();
		return JSON.parse(response);
	} catch (error) {
		console.error("Question generation error:", error);
		return [];
	}
}
