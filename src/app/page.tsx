// src/app/page.tsx

"use client";
import { useState } from "react";
import { generateQuestions } from "@/services/ai-service/ai-service";
import {
	getRecommendedProducts,
	extractProductInfo,
} from "@/services/walmart-service/walmart-service";
import SearchInput from "@/components/searchInput/SearchInput";
import Questions from "@/components/questions/Questions";

// Define interfaces for our data types
interface ProductRecommendation {
	product: any;
	score: number;
	reasons: string[];
}

export default function Home() {
	const [step, setStep] = useState("search"); // 'search', 'questions', 'results'
	const [productQuery, setProductQuery] = useState("");
	const [budget, setBudget] = useState(0);
	const [budgetFeedback, setBudgetFeedback] = useState("");
	const [questions, setQuestions] = useState<any[]>([]);
	const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
	const [loading, setLoading] = useState(false);
	const [optimizedQuery, setOptimizedQuery] = useState("");
	const [error, setError] = useState("");

	const handleSearch = async (query: string, budgetAmount: number) => {
		setProductQuery(query);
		setBudget(budgetAmount);

		try {
			const generatedQuestions = await generateQuestions(query, budgetAmount);
			setQuestions(generatedQuestions);
			setStep("questions");
		} catch (error) {
			console.error("Error generating questions:", error);
			setError("Failed to generate questions. Please try again.");
		}
	};

	const handleFormSubmit = async (answers: Record<string, string>) => {
		try {
			setLoading(true);

			// Get recommended products
			const result = await getRecommendedProducts(
				productQuery,
				budget || null,
				answers,
				5 // Get top 5 recommendations
			);

			setOptimizedQuery(result.optimizedQuery);
			setRecommendations(result.recommendations || []);
			setLoading(false);
			setStep("results");
		} catch (error) {
			console.error("Error getting recommendations:", error);
			setError("Failed to get product recommendations. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-4xl mx-auto">
				{step === "search" && <SearchInput onSearch={handleSearch} />}

				{step === "questions" && (
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-xl font-bold mb-4">
							Finding the perfect {productQuery}
						</h2>

						{budgetFeedback && (
							<div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
								{budgetFeedback}
							</div>
						)}

						<p className="mb-6">
							To help you find the best options, please answer these
							questions:
						</p>

						<div className="bg-gray-100 p-4 rounded">
							<Questions
								questionsList={questions}
								onSubmit={handleFormSubmit}
							/>
						</div>
					</div>
				)}

				{step === "results" && (
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-xl font-bold mb-4">
							Your Recommended Products
						</h2>

						{loading ? (
							<div className="flex justify-center my-8">
								<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
								<p className="ml-4">
									Finding the perfect products for you...
								</p>
							</div>
						) : error ? (
							<div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6">
								{error}
							</div>
						) : recommendations.length === 0 ? (
							<div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 mb-6">
								<p className="font-medium">
									No products found matching your requirements.
								</p>
								<p className="mt-2">
									Try adjusting your search criteria or budget.
								</p>
							</div>
						) : (
							<>
								<p className="mb-4 text-gray-600">
									Based on your requirements, we've found these top
									recommendations:
								</p>

								{recommendations.map((item, index) => {
									const product = extractProductInfo(item.product);
									return (
										<div
											key={product.id}
											className="mb-6 border rounded-lg overflow-hidden"
										>
											<div className="flex flex-col md:flex-row">
												<div className="w-full md:w-1/3 bg-gray-100 flex items-center justify-center p-4">
													{product.image ? (
														<img
															src={product.image}
															alt={product.name}
															className="max-h-48 object-contain"
														/>
													) : (
														<div className="h-48 w-full bg-gray-200 flex items-center justify-center">
															<p className="text-gray-500">
																No image
															</p>
														</div>
													)}
												</div>
												<div className="w-full md:w-2/3 p-4">
													<div className="flex justify-between items-start">
														<h3 className="text-lg font-semibold">
															{product.name}
														</h3>
														<div className="text-right">
															<p className="text-xl font-bold">
																$
																{product.price.toFixed(2)}
															</p>
															{product.originalPrice &&
																product.originalPrice >
																	product.price && (
																	<p className="text-sm text-gray-500 line-through">
																		$
																		{product.originalPrice.toFixed(
																			2
																		)}
																	</p>
																)}
														</div>
													</div>
													<p className="text-sm text-gray-600 mt-1">
														<span className="font-medium">
															Brand:
														</span>{" "}
														{product.brand}
													</p>
													<p className="text-sm mt-1">
														<span className="font-medium">
															Rating:
														</span>{" "}
														{product.rating} (
														{product.reviewCount} reviews)
													</p>
													<div className="mt-3">
														<h4 className="font-medium text-sm">
															Why this is a good match:
														</h4>
														<ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
															{item.reasons.map(
																(reason, idx) => (
																	<li key={idx}>
																		{reason}
																	</li>
																)
															)}
														</ul>
													</div>
													<div className="mt-4">
														<a
															href={product.productUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
														>
															View on Walmart
														</a>
													</div>
												</div>
											</div>
										</div>
									);
								})}

								{optimizedQuery && (
									<div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
										<p>
											<strong>Search query used:</strong> "
											{optimizedQuery}"
										</p>
									</div>
								)}
							</>
						)}

						<button
							className="mt-6 p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
							onClick={() => setStep("search")}
						>
							Start Over
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
