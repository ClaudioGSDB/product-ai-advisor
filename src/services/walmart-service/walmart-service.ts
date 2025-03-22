//service for fetching product data from walmart api

import { generateSearchQuery, rankProducts } from "@/services/ai-service/ai-service";

export async function fetchTrendingProducts() {
	try {
		const response = await fetch("/api/walmart");

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching trending products:", error);
		throw error;
	}
}

export async function searchProducts(
	productQuery: string,
	budget: number | null,
	userRequirements: Record<string, string>
) {
	try {
		// Step 1: Generate optimized search query using AI
		console.log("Generating search query...");
		const searchParams = await generateSearchQuery(
			productQuery,
			budget,
			userRequirements
		);

		// Step 2: Build API endpoint with search parameters
		let endpoint = `api-proxy/service/affil/product/v2/search?query=${encodeURIComponent(
			searchParams.searchQuery
		)}`;

		// Add sort parameters if specified
		if (searchParams.sortStrategy && searchParams.sortStrategy !== "relevance") {
			endpoint += `&sort=${searchParams.sortStrategy}`;

			// Add sort order for price sorting
			if (searchParams.sortStrategy === "price" && searchParams.sortOrder) {
				endpoint += `&order=${searchParams.sortOrder}`;
			}
		}

		// Set number of items to return (max 25)
		endpoint += "&numItems=25";

		console.log("Search endpoint:", endpoint);

		// Step 3: Make the API request
		const response = await fetch(
			`/api/walmart?endpoint=${encodeURIComponent(endpoint)}`
		);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();
		console.log(`Found ${data.totalResults || 0} search results`);

		// Step 4: Filter products by budget if specified
		let filteredProducts = data.items || [];

		if (budget && filteredProducts.length > 0) {
			// Allow products slightly over budget (10%)
			const maxPrice = budget * 1.1;

			// Filter out products that exceed the max price
			const withinBudget = filteredProducts.filter(
				(product: any) => product.salePrice <= maxPrice
			);

			// Only use budget filtering if it doesn't eliminate all products
			if (withinBudget.length > 0) {
				filteredProducts = withinBudget;
			}
		}

		return {
			query: searchParams.searchQuery,
			products: filteredProducts,
			totalResults: filteredProducts.length,
			originalQuery: productQuery,
		};
	} catch (error) {
		console.error("Error searching products:", error);
		throw error;
	}
}

// Get top recommended products based on user requirements
export async function getRecommendedProducts(
	productQuery: string,
	budget: number | null,
	userRequirements: Record<string, string>,
	maxResults: number = 5
) {
	try {
		// Step 1: Search for products using the optimized query
		const searchResults = await searchProducts(
			productQuery,
			budget,
			userRequirements
		);

		// If no products found, return empty recommendations
		if (!searchResults.products || searchResults.products.length === 0) {
			return {
				products: [],
				originalQuery: productQuery,
				optimizedQuery: searchResults.query,
			};
		}

		// Step 2: Rank products based on user requirements
		console.log("Ranking products...");
		const rankedProducts = await rankProducts(
			searchResults.products,
			userRequirements,
			maxResults
		);

		// Step 3: Return recommendations with explanations
		return {
			recommendations: rankedProducts,
			originalQuery: productQuery,
			optimizedQuery: searchResults.query,
			totalResults: searchResults.totalResults,
		};
	} catch (error) {
		console.error("Error getting recommended products:", error);
		throw error;
	}
}

// Extract key product information for display
export function extractProductInfo(product: any) {
	return {
		id: product.itemId,
		name: product.name,
		brand: product.brandName || "Unknown",
		price: product.salePrice,
		originalPrice: product.msrp,
		image: product.largeImage || product.mediumImage || product.thumbnailImage,
		description: product.shortDescription || "",
		rating: product.customerRating || "No rating",
		reviewCount: product.numReviews || 0,
		productUrl: product.productTrackingUrl || "",
		category: product.categoryPath || "",
	};
}
