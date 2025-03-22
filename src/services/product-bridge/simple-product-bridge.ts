// src/services/product-bridge/simple-product-bridge.ts

import { findCategoryId } from "./simple-category-finder";
import { buildOptimizedQuery, determineSortStrategy } from "./simple-query-builder";

interface WalmartSearchParams {
	query: string;
	categoryId?: string;
	sort?: string;
	order?: "ascending" | "descending";
	start?: number;
	numItems?: number;
}

/**
 * Convert search parameters to a URL query string
 */
function buildSearchQueryString(params: WalmartSearchParams): string {
	const queryParts: string[] = [];

	// Add query
	if (params.query) {
		queryParts.push(`query=${encodeURIComponent(params.query)}`);
	}

	// Add category ID if provided
	if (params.categoryId) {
		queryParts.push(`categoryId=${encodeURIComponent(params.categoryId)}`);
	}

	// Add sort parameters
	if (params.sort) {
		queryParts.push(`sort=${encodeURIComponent(params.sort)}`);

		if (params.sort === "price" && params.order) {
			queryParts.push(`order=${params.order}`);
		}
	}

	// Add pagination parameters
	if (params.start !== undefined) {
		queryParts.push(`start=${params.start}`);
	}

	if (params.numItems) {
		queryParts.push(`numItems=${params.numItems}`);
	}

	return queryParts.join("&");
}

/**
 * Build a complete Walmart API endpoint URL from user requirements
 */
export async function buildApiEndpoint(
	productQuery: string,
	budget: number,
	userRequirements: Record<string, string>
): Promise<string> {
	try {
		console.log("Building API endpoint for:", productQuery);

		// Step 1: Find relevant category ID
		const categoryId = await findCategoryId(productQuery);

		// Step 2: Build optimized search query
		const optimizedQuery = buildOptimizedQuery(productQuery, userRequirements);

		// Step 3: Determine best sort strategy
		const sortStrategy = determineSortStrategy(
			productQuery,
			budget,
			userRequirements
		);

		// Step 4: Combine everything into search parameters
		const searchParams: WalmartSearchParams = {
			query: optimizedQuery,
			numItems: 25, // Request more items for better post-filtering
		};

		// Add category ID if found
		if (categoryId) {
			searchParams.categoryId = categoryId;
		}

		// Add sort parameters if determined
		if (sortStrategy.sort) {
			searchParams.sort = sortStrategy.sort;

			if (sortStrategy.order) {
				searchParams.order = sortStrategy.order;
			}
		}

		// Step 5: Build and return the complete endpoint URL
		const queryString = buildSearchQueryString(searchParams);
		return `/api/walmart?endpoint=api-proxy/service/affil/product/v2/search?${queryString}`;
	} catch (error) {
		console.error("Error building API endpoint:", error);

		// Fallback to basic search if anything goes wrong
		return `/api/walmart?endpoint=api-proxy/service/affil/product/v2/search?query=${encodeURIComponent(
			productQuery
		)}`;
	}
}

/**
 * Search for products using the Walmart API
 */
export async function searchWalmartProducts(
	productQuery: string,
	budget: number,
	userRequirements: Record<string, string>
) {
	try {
		// Build the API endpoint
		const endpoint = await buildApiEndpoint(productQuery, budget, userRequirements);

		console.log("Searching with endpoint:", endpoint);

		// Make the API request
		const response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();

		// Apply budget filtering if budget is specified
		let results = data.items || [];

		if (budget > 0) {
			// Allow a slight buffer over budget (10%)
			const maxPrice = budget * 1.1;

			// Filter out products that exceed the max price
			results = results.filter(
				(product: any) => product.salePrice && product.salePrice <= maxPrice
			);
		}

		return {
			products: results,
			totalResults: results.length,
			originalQuery: productQuery,
			optimizedQuery: data.query,
			endpoint,
		};
	} catch (error) {
		console.error("Error searching Walmart products:", error);
		throw error;
	}
}

/**
 * Get all the available product information from search results
 */
export function extractProductInfo(product: any) {
	return {
		id: product.itemId,
		name: product.name,
		brand: product.brandName || "Unknown",
		price: product.salePrice,
		originalPrice: product.msrp,
		description: product.shortDescription || "",
		longDescription: product.longDescription || "",
		image: product.largeImage || product.mediumImage || product.thumbnailImage,
		rating: product.customerRating || "No rating",
		reviewCount: product.numReviews || 0,
		productUrl: product.productTrackingUrl || "",
		inStock: product.stock === "Available",
		category: product.categoryPath || "",
	};
}
