// src/services/product-bridge/simple-query-builder.ts

/**
 * Build an optimized search query based on the product query and user requirements
 */
export function buildOptimizedQuery(
	productQuery: string,
	userRequirements: Record<string, string>
): string {
	// Start with the original product query
	let optimizedQuery = productQuery;

	// Extract key terms from user requirements
	const keyTerms: string[] = [];

	// Analyze each question and answer
	Object.entries(userRequirements).forEach(([question, answer]) => {
		const lowerQuestion = question.toLowerCase();
		const lowerAnswer = answer.toLowerCase();

		// Skip if the answer is very short or generic
		if (
			answer.length < 3 ||
			["yes", "no", "maybe", "not sure"].includes(lowerAnswer)
		) {
			return;
		}

		// Extract brand preferences
		if (lowerQuestion.includes("brand") || lowerQuestion.includes("manufacturer")) {
			// Extract brand names (usually capitalized words)
			const brandMatches = answer.match(/\b[A-Z][a-zA-Z]*\b/g);
			if (brandMatches && brandMatches.length > 0) {
				// Add specific brands to key terms
				keyTerms.push(...brandMatches);
			}
		}

		// Extract size/dimension preferences
		if (lowerQuestion.includes("size") || lowerQuestion.includes("inch")) {
			// Look for numeric dimensions
			const sizeMatches = answer.match(
				/\d+(\.\d+)?[""]?\s*inch(es)?|\d+(\.\d+)?[""]?/g
			);
			if (sizeMatches && sizeMatches.length > 0) {
				keyTerms.push(...sizeMatches);
			}
		}

		// Extract feature preferences
		if (lowerQuestion.includes("feature") || lowerQuestion.includes("important")) {
			// Split answer into separate features, assuming comma or 'and' separation
			const features = answer.split(/,|\sand\s/);
			features.forEach((feature) => {
				const trimmedFeature = feature.trim();
				if (trimmedFeature.length > 3) {
					keyTerms.push(trimmedFeature);
				}
			});
		}

		// Add specific terms for different product types
		if (productQuery.toLowerCase().includes("laptop")) {
			if (lowerQuestion.includes("gaming")) {
				if (lowerAnswer.includes("yes") || lowerAnswer.includes("gaming")) {
					keyTerms.push("gaming");
				}
			}

			if (lowerQuestion.includes("memory") || lowerQuestion.includes("ram")) {
				const ramMatches = answer.match(/\d+\s*gb|gigabyte/gi);
				if (ramMatches && ramMatches.length > 0) {
					keyTerms.push(...ramMatches);
				}
			}

			if (lowerQuestion.includes("processor") || lowerQuestion.includes("cpu")) {
				if (
					lowerAnswer.includes("intel") ||
					lowerAnswer.includes("i5") ||
					lowerAnswer.includes("i7")
				) {
					keyTerms.push("Intel");

					if (lowerAnswer.includes("i5")) keyTerms.push("i5");
					if (lowerAnswer.includes("i7")) keyTerms.push("i7");
					if (lowerAnswer.includes("i9")) keyTerms.push("i9");
				}

				if (lowerAnswer.includes("amd") || lowerAnswer.includes("ryzen")) {
					keyTerms.push("AMD");
					if (lowerAnswer.includes("ryzen")) keyTerms.push("Ryzen");
				}
			}
		}

		if (productQuery.toLowerCase().includes("headphone")) {
			if (
				lowerQuestion.includes("wireless") ||
				lowerQuestion.includes("bluetooth")
			) {
				if (
					lowerAnswer.includes("yes") ||
					lowerAnswer.includes("wireless") ||
					lowerAnswer.includes("bluetooth")
				) {
					keyTerms.push("wireless");
					keyTerms.push("bluetooth");
				}
			}

			if (
				lowerQuestion.includes("noise") ||
				lowerQuestion.includes("cancellation")
			) {
				if (
					lowerAnswer.includes("yes") ||
					lowerAnswer.includes("noise") ||
					lowerAnswer.includes("cancellation")
				) {
					keyTerms.push("noise cancelling");
				}
			}
		}

		// Add more product-specific extractions as needed
	});

	// Remove duplicate terms
	const uniqueTerms = [...new Set(keyTerms)];

	// Limit to the most important terms (to avoid overly specific queries)
	const maxTerms = 3;
	const selectedTerms = uniqueTerms.slice(0, maxTerms);

	// Add the selected terms to the query
	if (selectedTerms.length > 0) {
		optimizedQuery += " " + selectedTerms.join(" ");
	}

	console.log("Original query:", productQuery);
	console.log("Optimized query:", optimizedQuery);

	return optimizedQuery;
}

/**
 * Determine the best sort strategy based on user requirements
 */
export function determineSortStrategy(
	productQuery: string,
	budget: number,
	userRequirements: Record<string, string>
): { sort?: string; order?: "ascending" | "descending" } {
	// Default sort is by relevance (no need to specify)
	let sort: string | undefined = undefined;
	let order: "ascending" | "descending" | undefined = undefined;

	// Check if budget is a major concern
	const isBudgetConcern = budget > 0;

	// Look for price sensitivity in user responses
	let isPriceSensitive = false;
	let isQualitySensitive = false;

	Object.entries(userRequirements).forEach(([question, answer]) => {
		const lowerQuestion = question.toLowerCase();
		const lowerAnswer = answer.toLowerCase();

		// Check for price sensitivity
		if (
			lowerQuestion.includes("budget") ||
			lowerQuestion.includes("price") ||
			lowerQuestion.includes("cost")
		) {
			if (
				lowerAnswer.includes("important") ||
				lowerAnswer.includes("concerned") ||
				lowerAnswer.includes("low") ||
				lowerAnswer.includes("cheap")
			) {
				isPriceSensitive = true;
			}
		}

		// Check for quality focus
		if (
			lowerQuestion.includes("quality") ||
			lowerQuestion.includes("important feature")
		) {
			if (
				lowerAnswer.includes("high quality") ||
				lowerAnswer.includes("best") ||
				lowerAnswer.includes("premium") ||
				lowerAnswer.includes("reliable")
			) {
				isQualitySensitive = true;
			}
		}
	});

	// Determine the sort strategy
	if (isPriceSensitive || (isBudgetConcern && budget < 100)) {
		// Price-sensitive users
		sort = "price";
		order = "ascending";
	} else if (isQualitySensitive) {
		// Quality-sensitive users
		sort = "customerRating";
	} else if (isBudgetConcern) {
		// Users with a budget but not explicitly price-sensitive
		sort = "bestseller"; // Get popular items within their budget
	}

	console.log("Selected sort strategy:", sort || "relevance", order || "");

	return { sort, order };
}
