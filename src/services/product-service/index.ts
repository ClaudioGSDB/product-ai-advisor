// src/services/product-service/index.ts
import {
	mockProductSearch,
	processUserQuery,
	getTopRecommendations,
} from "./mock-service";
import {
	Product,
	SearchFilters,
	SearchResults,
	QueryProcessingResult,
} from "@/types/product";

const mockProducts: Product[] = [
	{
		id: "1",
		title: "XPS Ultra Gaming Laptop - 16GB RAM, RTX 3070, 1TB SSD",
		description:
			"Experience ultimate gaming performance with this powerful gaming laptop featuring NVIDIA GeForce RTX 3070 graphics, 16GB RAM, and a blazing-fast 1TB NVMe SSD.",
		price: 1299.99,
		originalPrice: 1499.99,
		rating: 4.7,
		reviewCount: 852,
		image: "/api/placeholder/400/300",
		url: "https://www.amazon.com/dp/B09DP8X5F7",
		features: [
			"NVIDIA GeForce RTX 3070 8GB Graphics",
			"Intel Core i7-12700H Processor (14 cores, up to 4.7GHz)",
			"16GB DDR5 RAM",
			"1TB NVMe SSD",
			"15.6-inch Full HD 144Hz Display",
		],
		specifications: {
			Processor: "Intel Core i7-12700H",
			RAM: "16GB DDR5",
			Storage: "1TB NVMe SSD",
			Graphics: "NVIDIA GeForce RTX 3070",
		},
		category: "Computers",
		subcategory: "Gaming Laptops",
		brand: "XPS",
		availabilityStatus: "In Stock",
		prime: true,
		amazonChoice: true,
	},
	{
		id: "2",
		title: "ProBook Business Laptop - Intel i5, 8GB RAM, 512GB SSD",
		description:
			"Stay productive with this reliable business laptop featuring an Intel Core i5 processor, 8GB RAM, and 512GB SSD.",
		price: 749.99,
		originalPrice: 849.99,
		rating: 4.5,
		reviewCount: 1243,
		image: "/api/placeholder/400/300",
		url: "https://www.amazon.com/dp/B08LZ9JCHF",
		features: [
			"Intel Core i5-1135G7 Processor",
			"8GB DDR4 RAM",
			"512GB PCIe NVMe SSD",
			"14-inch Full HD IPS Display",
			"Windows 11 Pro",
		],
		specifications: {
			Processor: "Intel Core i5-1135G7",
			RAM: "8GB DDR4",
			Storage: "512GB PCIe NVMe SSD",
			Display: "14-inch Full HD IPS",
		},
		category: "Computers",
		subcategory: "Business Laptops",
		brand: "ProBook",
		availabilityStatus: "In Stock",
		prime: true,
	},
	{
		id: "3",
		title: "Budget Student Chromebook - Intel Celeron, 4GB RAM, 64GB eMMC",
		description:
			"Perfect for students and everyday tasks, this affordable Chromebook offers reliable performance with its Intel Celeron processor.",
		price: 249.99,
		originalPrice: 299.99,
		rating: 4.2,
		reviewCount: 2156,
		image: "/api/placeholder/400/300",
		url: "https://www.amazon.com/dp/B09QRNJ48C",
		features: [
			"Intel Celeron N4020 Processor",
			"4GB LPDDR4 RAM",
			"64GB eMMC Storage",
			"11.6-inch HD Display",
			"Chrome OS",
		],
		specifications: {
			Processor: "Intel Celeron N4020",
			RAM: "4GB LPDDR4",
			Storage: "64GB eMMC",
			Display: "11.6-inch HD",
		},
		category: "Computers",
		subcategory: "Chromebooks",
		brand: "Acer",
		availabilityStatus: "In Stock",
		prime: true,
	},
];

// This flag will be set based on environment variables when you get PA API access
const USE_REAL_API = false; // process.env.USE_AMAZON_API === 'true';

/**
 * Process a user query to extract important parameters and suggest questions
 */
export async function analyzeUserQuery(
	query: string,
	budget?: number
): Promise<QueryProcessingResult> {
	// In the future, we'll add the real implementation here
	return processUserQuery(query, budget);
}

/**
 * Search for products based on a query and filters
 */
export async function searchProducts(
	query: string,
	filters: SearchFilters = {},
	userRequirements: Record<string, any> = {}
): Promise<SearchResults> {
	// In the future, we'll add the real API implementation here
	return mockProductSearch(query, filters, userRequirements);
}

/**
 * Get top product recommendations based on user query and answers
 */
export async function getRecommendedProducts(
	query: string,
	userAnswers: Record<string, string>,
	budget?: number
): Promise<Product[]> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1500));

	// Filter by budget if provided
	let filtered = mockProducts;
	if (budget) {
		filtered = filtered.filter((product) => product.price <= budget);
	}

	// Score products based on query and user answers
	const scoredProducts = filtered.map((product) => {
		let score = 0;

		// Match query terms
		const queryTerms = query.toLowerCase().split(" ");
		queryTerms.forEach((term) => {
			if (product.title.toLowerCase().includes(term)) score += 10;
			if (product.description.toLowerCase().includes(term)) score += 5;
			if (product.category.toLowerCase().includes(term)) score += 8;
		});

		// Match user answers
		Object.entries(userAnswers).forEach(([_, answer]) => {
			if (product.title.toLowerCase().includes(answer.toLowerCase()))
				score += 15;
			if (
				product.description.toLowerCase().includes(answer.toLowerCase())
			)
				score += 10;

			product.features.forEach((feature) => {
				if (feature.toLowerCase().includes(answer.toLowerCase()))
					score += 8;
			});
		});

		// Bonus for rating and special labels
		score += product.rating * 5;
		if (product.amazonChoice) score += 10;
		if (product.bestSeller) score += 10;

		return { product, score };
	});

	// Sort by score and return top results
	return scoredProducts
		.sort((a, b) => b.score - a.score)
		.map((item) => item.product)
		.slice(0, 3);
}

/**
 * Validate if a budget is realistic for a specific product category
 */
export async function validateProductBudget(
	query: string,
	budget: number
): Promise<{
	isRealistic: boolean;
	suggestedMinimum?: number;
	message: string;
}> {
	// Process the query to understand product category
	const queryAnalysis = await processUserQuery(query);

	const { min: estimatedMin, max: estimatedMax } =
		queryAnalysis.estimatedPriceRange;

	// Check if budget is realistic
	if (budget < estimatedMin) {
		return {
			isRealistic: false,
			suggestedMinimum: estimatedMin,
			message: `Your budget of $${budget} is lower than typical for ${query}. Most ${query} start around $${estimatedMin}.`,
		};
	}

	// If budget is within range or above, it's realistic
	return {
		isRealistic: true,
		message: "Your budget is realistic for this product category.",
	};
}
