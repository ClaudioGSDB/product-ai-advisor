// src/services/product-bridge/simple-category-finder.ts

/**
 * Find the most relevant category ID for a product query using the Walmart taxonomy API
 */
export async function findCategoryId(productQuery: string): Promise<string | null> {
	try {
		console.log(`Finding category ID for: ${productQuery}`);

		// Make request to Walmart taxonomy API
		const response = await fetch(
			"/api/walmart?endpoint=api-proxy/service/affil/product/v2/taxonomy"
		);

		if (!response.ok) {
			throw new Error(`Taxonomy API error: ${response.status}`);
		}

		const data = await response.json();

		// Extract search terms from product query
		const searchTerms = productQuery.toLowerCase().split(/\s+/);

		// Find all matching categories
		const matchingCategories: Array<{
			id: string;
			name: string;
			path: string;
			score: number;
		}> = [];

		// Function to search for categories that match any of the search terms
		function findMatchingCategories(categories: any[], parentPath: string = "") {
			if (!categories || !Array.isArray(categories)) return;

			categories.forEach((category) => {
				const categoryName = category.name?.toLowerCase() || "";
				const currentPath = parentPath
					? `${parentPath} > ${category.name}`
					: category.name;

				// Check if category name matches any search term
				let matchScore = 0;
				searchTerms.forEach((term) => {
					if (categoryName.includes(term)) {
						// Score based on exact match and position in hierarchy
						matchScore += 10;

						// Higher score for categories in Electronics department
						if (currentPath.includes("Electronics")) {
							matchScore += 5;
						}

						// Bonus score for more specific categories (deeper in the hierarchy)
						matchScore += (currentPath.split(">").length - 1) * 2;
					}
				});

				if (matchScore > 0) {
					matchingCategories.push({
						id: category.id,
						name: category.name,
						path: currentPath,
						score: matchScore,
					});
				}

				// Recursively search child categories
				if (category.children && Array.isArray(category.children)) {
					findMatchingCategories(category.children, currentPath);
				}
			});
		}

		// Start search from root categories
		findMatchingCategories(data.categories);

		// Sort matching categories by score (highest first)
		matchingCategories.sort((a, b) => b.score - a.score);

		console.log("Found matching categories:", matchingCategories.slice(0, 3));

		// Return the ID of the highest-scoring category, or null if no matches
		return matchingCategories.length > 0 ? matchingCategories[0].id : null;
	} catch (error) {
		console.error("Error finding category ID:", error);
		return null;
	}
}
