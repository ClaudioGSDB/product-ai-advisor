import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

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

/**
 * Generate an optimized search query for Walmart based on user requirements
 * @param productQuery The original product query
 * @param budget The user's budget (if any)
 * @param userRequirements The user's answers to questions
 * @returns Optimized search parameters
 */
export async function generateSearchQuery(
	productQuery: string,
	budget: number | null,
	userRequirements: Record<string, string>
): Promise<{
	searchQuery: string;
	sortStrategy?: "relevance" | "price" | "customerRating" | "bestseller";
	sortOrder?: "ascending" | "descending";
}> {
	try {
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash",
		});

		// Create a detailed prompt for Gemini
		const prompt = `
		You are an expert shopping assistant. Your job is to create the most effective search query for Walmart's product search based on a user's requirements.

		User is looking for: "${productQuery}"
		${budget ? `Budget: $${budget}` : "No specific budget provided"}
		
		User requirements based on questions and answers:
		${Object.entries(userRequirements)
			.map(
				([question, answer]) => `- Question: "${question}"\n  Answer: "${answer}"`
			)
			.join("\n")}
		
		Based on this information, create a search query that would find the most relevant products on Walmart.
		The query should include the product type and the most important specifications/requirements.
		
		Keep the query concise but specific (5-10 words). Focus on the most important requirements.
		Do not include price in the query itself.
		
		Also recommend the best sort strategy:
		- "relevance" (default) - best for general searches
		- "price" - best when budget is the main concern
		- "customerRating" - best when quality is the main concern
		- "bestseller" - best for popular, tried-and-tested products
		
		If "price" is selected, also specify sort order ("ascending" or "descending").
		
		Format your response as a JSON object:
		{
			"searchQuery": "your optimized search query",
			"sortStrategy": "one of the strategies above",
			"sortOrder": "ascending or descending (only if sortStrategy is price)"
		}
		
		Return ONLY the JSON object, no additional text.
		`;

		const result = await model.generateContent(prompt);
		const responseText = result.response.text();

		// Try to parse the JSON response
		try {
			// Find and extract the JSON object from the response
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);

			if (jsonMatch) {
				const parsedResponse = JSON.parse(jsonMatch[0]);
				return parsedResponse;
			} else {
				throw new Error("Failed to extract JSON from AI response");
			}
		} catch (parseError) {
			console.error("Error parsing AI response:", parseError);
			console.log("Raw AI response:", responseText);

			// Return a fallback response using the original query
			return {
				searchQuery: productQuery,
				sortStrategy: budget ? "price" : "relevance",
				sortOrder: budget ? "ascending" : undefined,
			};
		}
	} catch (error) {
		console.error("Error generating search query:", error);

		// Return a fallback response
		return {
			searchQuery: productQuery,
			sortStrategy: "relevance",
		};
	}
}

/**
 * Rank and filter products based on user requirements
 * @param products List of products from the search results
 * @param userRequirements User's answers to questions
 * @param maxResults Maximum number of results to return
 * @returns Ranked list of products with scores and reasons
 */
export async function rankProducts(
	products: any[],
	userRequirements: Record<string, string>,
	maxResults: number = 5
): Promise<
	Array<{
		product: any;
		score: number;
		reasons: string[];
	}>
> {
	try {
		// If no products, return empty array
		if (!products || products.length === 0) {
			return [];
		}

		// If only a few products, just sort by customer rating
		if (products.length <= maxResults) {
			return products
				.map((product) => ({
					product,
					score: parseFloat(product.customerRating || "0") * 20, // Convert 0-5 to 0-100
					reasons: ["Best available option based on your requirements"],
				}))
				.sort((a, b) => b.score - a.score);
		}

		// For more products, use AI to rank them
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash",
		});

		// Create simplified product representation for the AI
		const simplifiedProducts = products.slice(0, 15).map((product, index) => ({
			id: index,
			name: product.name,
			price: product.salePrice,
			brand: product.brandName || "Unknown",
			rating: product.customerRating || "0",
			reviewCount: product.numReviews || 0,
			description: product.shortDescription || "",
		}));

		const prompt = `
		You are an expert shopping assistant. Rank these products based on the user's requirements:
		
		User requirements:
		${Object.entries(userRequirements)
			.map(
				([question, answer]) => `- Question: "${question}"\n  Answer: "${answer}"`
			)
			.join("\n")}
		
		Here are the products to rank:
		${JSON.stringify(simplifiedProducts, null, 2)}
		
		For each product, assign a score (1-100) based on how well it matches the user's requirements.
		Also provide 2-3 specific reasons why each product is or isn't a good match.
		
		Format your response as a JSON array of objects:
		[
			{
				"id": 0,
				"score": 85,
				"reasons": ["Reason 1", "Reason 2"]
			},
			...
		]
		
		Sort the products by score (highest first).
		Return ONLY the JSON array, no additional text.
		`;

		const result = await model.generateContent(prompt);
		const responseText = result.response.text();

		try {
			const jsonMatch = responseText.match(/\[[\s\S]*\]/);

			if (jsonMatch) {
				const rankedProducts = JSON.parse(jsonMatch[0]);

				// Map back to full product objects
				return rankedProducts
					.map((item: any) => ({
						product: products[item.id],
						score: item.score,
						reasons: item.reasons,
					}))
					.sort((a: any, b: any) => b.score - a.score)
					.slice(0, maxResults);
			} else {
				throw new Error("Failed to extract JSON from AI response");
			}
		} catch (error) {
			console.error("Error parsing product ranking:", error);

			// Fallback: sort by a combination of customer rating and review count
			return products
				.map((product) => {
					const rating = parseFloat(product.customerRating || "0");
					const reviewCount = product.numReviews || 0;
					// Score formula: rating (0-5) * 10 + log of review count (to reduce impact of very high counts)
					const score =
						rating * 10 +
						(reviewCount > 0 ? Math.log10(reviewCount) * 10 : 0);

					return {
						product,
						score,
						reasons: ["Based on customer ratings and popularity"],
					};
				})
				.sort((a, b) => b.score - a.score)
				.slice(0, maxResults);
		}
	} catch (error) {
		console.error("Error ranking products:", error);

		// Fallback: just take the first N products
		return products.slice(0, maxResults).map((product) => ({
			product,
			score: 50,
			reasons: ["Recommended product for your needs"],
		}));
	}
}
