// File: src/app/walmart-test/page.tsx

"use client";
import { useState, useEffect } from "react";
import { fetchTrendingProducts } from "@/services/walmart-service/walmart-service";

// Simple interface for Walmart products
interface WalmartProduct {
	itemId: string;
	name: string;
	salePrice: number;
	imageUrl: string;
	productUrl: string;
	// Add other fields as needed
}

export default function WalmartTestPage() {
	const [products, setProducts] = useState<WalmartProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [apiResponse, setApiResponse] = useState<any>(null);

	useEffect(() => {
		async function loadProducts() {
			try {
				setLoading(true);
				const data = await fetchTrendingProducts();

				// Store the full API response for debugging
				setApiResponse(data);

				// Parse the response to extract products
				// Note: You may need to adjust this based on the actual API response structure
				if (data.items && Array.isArray(data.items)) {
					setProducts(data.items);
				} else {
					console.warn("Unexpected API response structure:", data);
					setProducts([]);
				}

				setError(null);
			} catch (err) {
				console.error("Failed to load products:", err);
				setError("Failed to load products. Please try again later.");
				setProducts([]);
			} finally {
				setLoading(false);
			}
		}

		loadProducts();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">Walmart API Test Page</h1>

				{loading && (
					<div className="flex justify-center items-center h-40">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
						<p className="ml-4">Loading trending products...</p>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
						<h3 className="text-red-800 font-medium">Error</h3>
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{!loading && !error && (
					<>
						<div className="mb-8">
							<h2 className="text-2xl font-bold mb-4">Trending Products</h2>

							{products.length === 0 ? (
								<div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
									<p className="text-yellow-700">
										No products found in the API response. Check the
										raw response below for details.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{products.map((product) => (
										<div
											key={product.itemId}
											className="bg-white rounded-lg shadow-md overflow-hidden"
										>
											<div className="h-48 bg-gray-200 flex items-center justify-center">
												{product.imageUrl ? (
													<img
														src={product.imageUrl}
														alt={product.name}
														className="max-h-full object-contain"
													/>
												) : (
													<p className="text-gray-500">
														No image available
													</p>
												)}
											</div>
											<div className="p-4">
												<h3 className="font-medium line-clamp-2 h-12">
													{product.name}
												</h3>
												<p className="text-lg font-bold mt-2">
													$
													{product.salePrice?.toFixed(2) ||
														"N/A"}
												</p>
												<a
													href={product.productUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="mt-4 block w-full p-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700 transition"
												>
													View on Walmart
												</a>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="mt-12 bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-bold mb-4">Raw API Response</h2>
							<p className="mb-2 text-gray-600">
								This is the raw response from the Walmart API for
								debugging purposes:
							</p>
							<div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(apiResponse, null, 2)}
								</pre>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
