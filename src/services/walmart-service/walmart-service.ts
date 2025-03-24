//service for fetching product data from walmart api

import { rankProducts } from "@/services/ai-service/ai-service";

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
		// Build simple search endpoint - focus on getting relevant candidates
		const endpoint = `api-proxy/service/affil/product/v2/search?query=${encodeURIComponent(
			productQuery
		)}&numItems=25`;

		console.log("Searching with endpoint:", endpoint);

		const response = await fetch(
			`/api/walmart?endpoint=${encodeURIComponent(endpoint)}`
		);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();
		let products = data.items || [];

		// Do basic budget filtering if specified
		if (budget && products.length > 0) {
			products = products.filter(
				(product: any) => product.salePrice <= budget * 1.1
			);
		}

		return {
			products,
			totalResults: products.length,
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
