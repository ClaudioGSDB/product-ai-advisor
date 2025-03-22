// src/app/test-product-bridge/page.tsx

"use client";
import { useState } from "react";
import {
	searchWalmartProducts,
	extractProductInfo,
} from "@/services/product-bridge/simple-product-bridge";

export default function TestProductBridgePage() {
	const [productQuery, setProductQuery] = useState("");
	const [budget, setBudget] = useState("");
	const [requirements, setRequirements] = useState([{ question: "", answer: "" }]);
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const addRequirement = () => {
		setRequirements([...requirements, { question: "", answer: "" }]);
	};

	const updateRequirement = (
		index: number,
		field: "question" | "answer",
		value: string
	) => {
		const updatedRequirements = [...requirements];
		updatedRequirements[index][field] = value;
		setRequirements(updatedRequirements);
	};

	const removeRequirement = (index: number) => {
		const updatedRequirements = [...requirements];
		updatedRequirements.splice(index, 1);
		setRequirements(updatedRequirements);
	};

	const handleSearch = async () => {
		if (!productQuery.trim()) return;

		try {
			setLoading(true);
			setError(null);

			// Convert requirements array to record
			const requirementsRecord: Record<string, string> = {};
			requirements.forEach((req) => {
				if (req.question.trim() && req.answer.trim()) {
					requirementsRecord[req.question] = req.answer;
				}
			});

			// Search for products
			const searchResults = await searchWalmartProducts(
				productQuery,
				parseFloat(budget) || 0,
				requirementsRecord
			);

			setResults(searchResults);
		} catch (err) {
			console.error("Error in product search:", err);
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Product Bridge Test</h1>

			<div className="bg-white p-6 rounded-lg shadow-md mb-8">
				<h2 className="text-xl font-semibold mb-4">Search Parameters</h2>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">
						Product Query
					</label>
					<input
						type="text"
						value={productQuery}
						onChange={(e) => setProductQuery(e.target.value)}
						placeholder="e.g., gaming laptop, wireless headphones"
						className="w-full p-2 border rounded"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">
						Budget (optional)
					</label>
					<input
						type="number"
						value={budget}
						onChange={(e) => setBudget(e.target.value)}
						placeholder="Enter amount"
						className="w-full p-2 border rounded"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-2">
						User Requirements
					</label>

					{requirements.map((req, index) => (
						<div key={index} className="flex gap-2 mb-2">
							<input
								type="text"
								value={req.question}
								onChange={(e) =>
									updateRequirement(index, "question", e.target.value)
								}
								placeholder="Question"
								className="flex-1 p-2 border rounded"
							/>
							<input
								type="text"
								value={req.answer}
								onChange={(e) =>
									updateRequirement(index, "answer", e.target.value)
								}
								placeholder="Answer"
								className="flex-1 p-2 border rounded"
							/>
							<button
								onClick={() => removeRequirement(index)}
								className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
							>
								×
							</button>
						</div>
					))}

					<button
						onClick={addRequirement}
						className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Add Requirement
					</button>
				</div>

				<button
					onClick={handleSearch}
					disabled={loading || !productQuery.trim()}
					className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
				>
					{loading ? "Searching..." : "Search Products"}
				</button>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
					<p>{error}</p>
				</div>
			)}

			{results && (
				<div>
					<div className="mb-6 p-4 bg-blue-50 rounded">
						<h2 className="text-lg font-semibold mb-2">Search Information</h2>
						<p>
							<strong>Original Query:</strong> {results.originalQuery}
						</p>
						<p>
							<strong>Optimized Query:</strong> {results.optimizedQuery}
						</p>
						<p>
							<strong>Total Results:</strong> {results.totalResults}
						</p>
						<p>
							<strong>Endpoint:</strong> {results.endpoint}
						</p>
					</div>

					<h2 className="text-xl font-semibold mb-4">Search Results</h2>

					{results.products && results.products.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{results.products.slice(0, 9).map((product: any) => {
								const info = extractProductInfo(product);
								return (
									<div
										key={info.id}
										className="bg-white rounded-lg shadow-md overflow-hidden"
									>
										<div className="h-48 bg-gray-200 flex items-center justify-center">
											{info.image ? (
												<img
													src={info.image}
													alt={info.name}
													className="max-h-full object-contain"
												/>
											) : (
												<div className="text-gray-500">
													No image
												</div>
											)}
										</div>
										<div className="p-4">
											<h3 className="font-medium line-clamp-2 h-12">
												{info.name}
											</h3>
											<p className="text-sm text-gray-600 mb-2">
												{info.brand}
											</p>
											<div className="flex justify-between items-center mb-2">
												<p className="text-lg font-bold">
													${info.price.toFixed(2)}
												</p>
												{info.originalPrice &&
													info.originalPrice > info.price && (
														<p className="text-sm text-gray-500 line-through">
															$
															{info.originalPrice.toFixed(
																2
															)}
														</p>
													)}
											</div>
											<p className="text-sm mb-3">
												<span className="font-medium">
													Rating:
												</span>{" "}
												{info.rating} ({info.reviewCount} reviews)
											</p>
											<a
												href={info.productUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="block w-full p-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700"
											>
												View on Walmart
											</a>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
							No products found matching your criteria.
						</p>
					)}

					{results.products && results.products.length > 9 && (
						<p className="mt-4 text-center text-gray-600">
							Showing 9 of {results.products.length} products
						</p>
					)}
				</div>
			)}
		</div>
	);
}
