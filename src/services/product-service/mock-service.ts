// src/services/product-service/mock-service.ts
import { mockProductDatabase } from "./mock-data";
import {
	Product,
	SearchFilters,
	SearchResults,
	QueryProcessingResult,
} from "@/types/product";

// Helper function to calculate relevance score based on query and product
const calculateRelevanceScore = (
	product: Product,
	query: string,
	requirements: Record<string, any>
): number => {
	let score = 0;
	const queryTerms = query.toLowerCase().split(" ");

	// Title match (highest weight)
	const titleLower = product.title.toLowerCase();
	queryTerms.forEach((term) => {
		if (titleLower.includes(term)) {
			score += 10;
		}
	});

	// Category match
	if (
		product.category.toLowerCase().includes(query.toLowerCase()) ||
		product.subcategory.toLowerCase().includes(query.toLowerCase())
	) {
		score += 8;
	}

	// Features match
	const featureText = product.features.join(" ").toLowerCase();
	queryTerms.forEach((term) => {
		if (featureText.includes(term)) {
			score += 5;
		}
	});

	// Description match
	const descriptionLower = product.description.toLowerCase();
	queryTerms.forEach((term) => {
		if (descriptionLower.includes(term)) {
			score += 3;
		}
	});

	// Specific requirements match
	if (requirements) {
		Object.entries(requirements).forEach(([key, value]) => {
			// Check for specifications match
			if (
				product.specifications[key] &&
				String(product.specifications[key]).toLowerCase() ===
					String(value).toLowerCase()
			) {
				score += 15; // High score for exact specification match
			}

			// Check features for this requirement
			if (typeof value === "string") {
				if (featureText.includes(value.toLowerCase())) {
					score += 8;
				}
			}
		});
	}

	// Bonus points for highly rated products
	score += product.rating * 2;

	// Bonus for Amazon's Choice or Best Seller
	if (product.amazonChoice) score += 5;
	if (product.bestSeller) score += 5;

	return score;
};

// Function to filter products based on search criteria
const filterProducts = (
	products: Product[],
	filters: SearchFilters
): Product[] => {
	return products.filter((product) => {
		// Price filter
		if (filters.minPrice && product.price < filters.minPrice) return false;
		if (filters.maxPrice && product.price > filters.maxPrice) return false;

		// Rating filter
		if (filters.minRating && product.rating < filters.minRating)
			return false;

		// Brand filter
		if (
			filters.brands &&
			filters.brands.length > 0 &&
			!filters.brands.includes(product.brand)
		)
			return false;

		// Prime filter
		if (filters.prime && !product.prime) return false;

		// Specification filters (dynamic based on product category)
		if (filters.specifications) {
			for (const [key, value] of Object.entries(filters.specifications)) {
				// Skip if the specification doesn't exist for this product
				if (!(key in product.specifications)) continue;

				const productValue = product.specifications[key];

				// Handle different types of values
				if (Array.isArray(value)) {
					// For array values, check if any match
					if (!value.includes(productValue)) return false;
				} else if (typeof value === "string") {
					// For string values, do case-insensitive comparison
					if (
						typeof productValue === "string" &&
						productValue.toLowerCase() !== value.toLowerCase()
					)
						return false;
				} else if (typeof value === "number") {
					// For number values
					if (
						typeof productValue === "number" &&
						productValue !== value
					)
						return false;
				} else if (typeof value === "boolean") {
					// For boolean values
					if (
						typeof productValue === "boolean" &&
						productValue !== value
					)
						return false;
				}
			}
		}

		return true;
	});
};

// Function to sort products based on criteria
const sortProducts = (
	products: Product[],
	sortBy: string = "relevance"
): Product[] => {
	const sortedProducts = [...products];

	switch (sortBy) {
		case "price_low":
			sortedProducts.sort((a, b) => a.price - b.price);
			break;
		case "price_high":
			sortedProducts.sort((a, b) => b.price - a.price);
			break;
		case "rating":
			sortedProducts.sort((a, b) => b.rating - a.rating);
			break;
		case "review_count":
			sortedProducts.sort((a, b) => b.reviewCount - a.reviewCount);
			break;
		// 'relevance' is handled separately with calculateRelevanceScore
		default:
			break;
	}

	return sortedProducts;
};

// Main search function that mimics Amazon PA API
export async function mockProductSearch(
	query: string,
	filters: SearchFilters = {},
	userRequirements: Record<string, any> = {}
): Promise<SearchResults> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	// Calculate relevance scores for all products
	const scoredProducts = mockProductDatabase.map((product) => ({
		product,
		relevanceScore: calculateRelevanceScore(
			product,
			query,
			userRequirements
		),
	}));

	// Sort by relevance score (if sortBy is 'relevance' or not specified)
	let sortedByRelevance = [...scoredProducts].sort(
		(a, b) => b.relevanceScore - a.relevanceScore
	);

	// Extract just the products
	let relevantProducts = sortedByRelevance.map((item) => item.product);

	// Apply filters
	const filteredProducts = filterProducts(relevantProducts, filters);

	// Apply secondary sorting if specified
	const sortedProducts =
		filters.sortBy && filters.sortBy !== "relevance"
			? sortProducts(filteredProducts, filters.sortBy)
			: filteredProducts;

	// Calculate category and brand filters
	const categoryFilters: Record<string, number> = {};
	const brandFilters: Record<string, number> = {};

	relevantProducts.forEach((product) => {
		// Count categories
		categoryFilters[product.category] =
			(categoryFilters[product.category] || 0) + 1;

		// Count brands
		brandFilters[product.brand] = (brandFilters[product.brand] || 0) + 1;
	});

	// Calculate price ranges
	const priceRanges = [
		{ min: 0, max: 50, count: 0 },
		{ min: 50, max: 100, count: 0 },
		{ min: 100, max: 200, count: 0 },
		{ min: 200, max: 500, count: 0 },
		{ min: 500, max: 1000, count: 0 },
		{ min: 1000, max: Number.MAX_SAFE_INTEGER, count: 0 },
	];

	relevantProducts.forEach((product) => {
		const range = priceRanges.find(
			(range) => product.price >= range.min && product.price < range.max
		);
		if (range) range.count++;
	});

	// Generate suggested filters based on the query and available products
	const suggestedFilters: string[] = [];

	// Add popular brands for this query
	const popularBrands = Object.entries(brandFilters)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(([brand]) => `Brand: ${brand}`);

	suggestedFilters.push(...popularBrands);

	// Add price range suggestions
	const relevantPriceRanges = priceRanges
		.filter((range) => range.count > 0)
		.slice(0, 2)
		.map((range) => {
			if (range.max === Number.MAX_SAFE_INTEGER) {
				return `Price: ${range.min}+`;
			}
			return `Price: ${range.min} - ${range.max}`;
		});

	suggestedFilters.push(...relevantPriceRanges);

	// Return search results with all the metadata
	return {
		products: sortedProducts.slice(0, 10), // Return top 10 products
		totalResults: relevantProducts.length,
		categoryFilters,
		brandFilters,
		priceRanges,
		suggestedFilters,
	};
}

// Process a user query to extract important parameters
export async function processUserQuery(
	query: string,
	budget?: number
): Promise<QueryProcessingResult> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Extract category
	let category: any = "Electronics"; // Default

	if (
		query.toLowerCase().includes("laptop") ||
		query.toLowerCase().includes("computer")
	) {
		category = "Computers";
	} else if (
		query.toLowerCase().includes("phone") ||
		query.toLowerCase().includes("smartphone")
	) {
		category = "Electronics";
	} else if (
		query.toLowerCase().includes("coffee") ||
		query.toLowerCase().includes("espresso")
	) {
		category = "Home & Kitchen";
	} else if (
		query.toLowerCase().includes("smart") ||
		query.toLowerCase().includes("alexa") ||
		query.toLowerCase().includes("speaker")
	) {
		category = "Smart Home";
	}

	// Extract keywords
	const keywords = query
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.split(" ")
		.filter((word) => word.length > 2);

	// Extract specific requirements
	const specificRequirements: Record<string, any> = {};

	// Gaming laptop detection
	if (
		query.toLowerCase().includes("gaming") &&
		(query.toLowerCase().includes("laptop") ||
			query.toLowerCase().includes("computer"))
	) {
		specificRequirements["Use Case"] = "Gaming";
		specificRequirements["Graphics"] = "Dedicated";
	}

	// Business laptop detection
	if (
		query.toLowerCase().includes("business") &&
		(query.toLowerCase().includes("laptop") ||
			query.toLowerCase().includes("computer"))
	) {
		specificRequirements["Use Case"] = "Business";
	}

	// RAM detection
	const ramMatch = query.match(/(\d+)\s?GB RAM/i);
	if (ramMatch) {
		specificRequirements["RAM"] = `${ramMatch[1]}GB`;
	}

	// Storage detection
	const storageMatch = query.match(/(\d+)\s?(GB|TB) (SSD|HDD)/i);
	if (storageMatch) {
		specificRequirements[
			"Storage"
		] = `${storageMatch[1]}${storageMatch[2]} ${storageMatch[3]}`;
	}

	// Coffee maker type detection
	if (query.toLowerCase().includes("espresso")) {
		specificRequirements["Type"] = "Espresso Machine";
	} else if (query.toLowerCase().includes("drip")) {
		specificRequirements["Type"] = "Drip Coffee Maker";
	} else if (
		query.toLowerCase().includes("single") ||
		query.toLowerCase().includes("k-cup") ||
		query.toLowerCase().includes("pod")
	) {
		specificRequirements["Type"] = "Single Serve";
	}

	// Estimate price range based on category and requirements
	let minPrice = 0;
	let maxPrice = 2000; // Default high end

	if (category === "Computers") {
		if (specificRequirements["Use Case"] === "Gaming") {
			minPrice = 800;
			maxPrice = 2500;
		} else if (specificRequirements["Use Case"] === "Business") {
			minPrice = 500;
			maxPrice = 1500;
		} else {
			minPrice = 300;
			maxPrice = 2000;
		}
	} else if (
		category === "Electronics" &&
		query.toLowerCase().includes("phone")
	) {
		minPrice = 200;
		maxPrice = 1200;
	} else if (
		category === "Home & Kitchen" &&
		query.toLowerCase().includes("coffee")
	) {
		if (specificRequirements["Type"] === "Espresso Machine") {
			minPrice = 200;
			maxPrice = 800;
		} else if (specificRequirements["Type"] === "Single Serve") {
			minPrice = 50;
			maxPrice = 200;
		} else {
			minPrice = 30;
			maxPrice = 300;
		}
	}

	// Override with user's budget if provided
	if (budget) {
		minPrice = 0;
		maxPrice = budget;
	}

	// Generate suggested questions based on category and current information
	const suggestedQuestions: string[] = [];

	if (category === "Computers") {
		if (!specificRequirements["Use Case"]) {
			suggestedQuestions.push(
				"What will you primarily use this computer for?"
			);
		}
		if (!specificRequirements["RAM"]) {
			suggestedQuestions.push("How much RAM do you need?");
		}
		if (!specificRequirements["Storage"]) {
			suggestedQuestions.push("How much storage space do you require?");
		}
	} else if (
		category === "Electronics" &&
		query.toLowerCase().includes("phone")
	) {
		suggestedQuestions.push("Do you prefer Android or iOS?");
		suggestedQuestions.push("How important is camera quality to you?");
		suggestedQuestions.push("Do you need 5G connectivity?");
	} else if (
		category === "Home & Kitchen" &&
		query.toLowerCase().includes("coffee")
	) {
		if (!specificRequirements["Type"]) {
			suggestedQuestions.push(
				"What type of coffee maker are you looking for?"
			);
		}
		suggestedQuestions.push("How many cups do you typically brew at once?");
		suggestedQuestions.push("Do you prefer programmable features?");
	}

	return {
		category,
		keywords,
		specificRequirements,
		suggestedQuestions: suggestedQuestions.slice(0, 3), // Limit to 3 questions
		estimatedPriceRange: { min: minPrice, max: maxPrice },
	};
}

// Get top recommendations based on user requirements
export async function getTopRecommendations(
	query: string,
	userAnswers: Record<string, string>,
	budget?: number
): Promise<Product[]> {
	// Process the query to understand user needs
	const queryAnalysis = await processUserQuery(query, budget);

	// Convert user answers to search parameters
	const searchParams: Record<string, any> = {
		...queryAnalysis.specificRequirements,
	};

	// Process user answers to extract additional requirements
	Object.entries(userAnswers).forEach(([question, answer]) => {
		// This is simplified - in a real implementation, you'd map each question
		// to specific product parameters based on the question content
		if (question.includes("use") || question.includes("purpose")) {
			searchParams["Use Case"] = answer;
		}
		if (question.includes("RAM") || question.includes("memory")) {
			searchParams["RAM"] = answer;
		}
		if (question.includes("storage")) {
			searchParams["Storage"] = answer;
		}
		if (question.includes("type")) {
			searchParams["Type"] = answer;
		}
		// Add more mappings as needed
	});

	// Create filters based on budget
	const filters: SearchFilters = {};
	if (budget) {
		filters.maxPrice = budget;
	}

	// Search for products
	const searchResults = await mockProductSearch(query, filters, searchParams);

	// Return top 3 recommendations
	return searchResults.products.slice(0, 3);
}
