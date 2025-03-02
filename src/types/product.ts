// src/types/product.ts
export interface Product {
	id: string;
	title: string;
	description: string;
	price: number;
	originalPrice?: number;
	rating: number;
	reviewCount: number;
	image: string;
	url: string;
	features: string[];
	specifications: Record<string, string>;
	category: string;
	subcategory: string;
	brand: string;
	availabilityStatus: "In Stock" | "Low Stock" | "Out of Stock";
	prime: boolean;
	amazonChoice?: boolean;
	bestSeller?: boolean;
}

export interface SearchFilters {
	minPrice?: number;
	maxPrice?: number;
	minRating?: number;
	brands?: string[];
	sortBy?:
		| "relevance"
		| "price_low"
		| "price_high"
		| "rating"
		| "review_count";
	prime?: boolean;
	specifications?: Record<string, string | number | boolean | string[]>;
}

export type ProductCategory =
	| "Electronics"
	| "Computers"
	| "Smart Home"
	| "Home & Kitchen"
	| "Clothing"
	| "Beauty"
	| "Toys"
	| "Sports & Outdoors"
	| "Books"
	| "Health & Personal Care";

export interface SearchResults {
	products: Product[];
	totalResults: number;
	categoryFilters: Record<string, number>;
	brandFilters: Record<string, number>;
	priceRanges: { min: number; max: number; count: number }[];
	suggestedFilters: string[];
}

export interface QueryProcessingResult {
	category: ProductCategory;
	keywords: string[];
	specificRequirements: Record<string, any>;
	suggestedQuestions: string[];
	estimatedPriceRange: { min: number; max: number };
}
