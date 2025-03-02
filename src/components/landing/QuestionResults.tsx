// src/components/landing/QuestionResults.tsx
import { useState, useEffect } from "react";
import { getRecommendedProducts } from "@/services/product-service";
import { Product } from "@/types/product";

interface QuestionResultsProps {
	productQuery: string;
	budget: number;
	userAnswers: Record<string, string>;
	onStartOver: () => void;
}

export default function QuestionResults({
	productQuery,
	budget,
	userAnswers,
	onStartOver,
}: QuestionResultsProps) {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setIsLoading(true);
				const recommendations = await getRecommendedProducts(
					productQuery,
					userAnswers,
					budget
				);
				setProducts(recommendations);
			} catch (err) {
				console.error("Error fetching recommendations:", err);
				setError(
					"Unable to fetch product recommendations. Please try again."
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
	}, [productQuery, budget, userAnswers]);

	if (isLoading) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md text-center">
				<h2 className="text-xl font-bold mb-6">
					Finding the perfect {productQuery} for you
				</h2>
				<div className="flex justify-center my-8">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
				<p className="text-gray-600">
					Analyzing your requirements and searching for the best
					matches...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-bold mb-4">
					Oops! Something went wrong
				</h2>
				<p className="text-red-600 mb-6">{error}</p>
				<button
					onClick={onStartOver}
					className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
				>
					Try Again
				</button>
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-bold mb-4">No Products Found</h2>
				<p className="text-gray-600 mb-6">
					We couldn't find any products matching your specific
					requirements. Try adjusting your criteria or budget.
				</p>
				<button
					onClick={onStartOver}
					className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
				>
					Start Over
				</button>
			</div>
		);
	}

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h2 className="text-xl font-bold mb-4">
				Top Recommendations for You
			</h2>

			<p className="text-gray-600 mb-6">
				Based on your requirements, here are the best {productQuery}{" "}
				options we found:
			</p>

			<div className="space-y-8">
				{products.map((product, index) => (
					<div
						key={product.id}
						className="border rounded-lg overflow-hidden hover:shadow-lg transition"
					>
						<div className="bg-gray-50 p-4 border-b">
							<span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
								{index === 0
									? "Best Match"
									: index === 1
									? "Runner Up"
									: "Also Great"}
							</span>
							<h3 className="text-lg font-bold">
								{product.title}
							</h3>
						</div>

						<div className="p-4">
							<div className="flex flex-col md:flex-row gap-6">
								<div className="w-full md:w-1/3 flex justify-center">
									<div className="bg-gray-100 h-48 w-full flex items-center justify-center rounded">
										<img
											src={product.image}
											alt={product.title}
											className="max-h-full max-w-full object-contain"
											onError={(e) => {
												(
													e.target as HTMLImageElement
												).src =
													"/api/placeholder/400/300";
											}}
										/>
									</div>
								</div>

								<div className="w-full md:w-2/3">
									<div className="flex justify-between items-start mb-4">
										<div>
											<span className="text-2xl font-bold text-blue-600">
												${product.price.toFixed(2)}
											</span>
											{product.originalPrice &&
												product.originalPrice >
													product.price && (
													<span className="ml-2 text-gray-500 line-through">
														$
														{product.originalPrice.toFixed(
															2
														)}
													</span>
												)}
										</div>

										<div className="flex items-center">
											<div className="flex items-center mr-2">
												{[...Array(5)].map((_, i) => (
													<svg
														key={i}
														className={`w-4 h-4 fill-current ${
															i <
															Math.floor(
																product.rating
															)
																? "text-yellow-500"
																: "text-gray-300"
														}`}
														viewBox="0 0 20 20"
													>
														<path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
													</svg>
												))}
											</div>
											<span className="text-sm text-gray-600">
												({product.reviewCount})
											</span>
										</div>
									</div>

									<p className="text-gray-600 mb-4">
										{product.description}
									</p>

									<div className="mb-4">
										<h4 className="font-bold mb-2">
											Key Features:
										</h4>
										<ul className="list-disc list-inside space-y-1 text-gray-700">
											{product.features
												.slice(0, 4)
												.map((feature, i) => (
													<li key={i}>{feature}</li>
												))}
										</ul>
									</div>
									<a
										href={product.url}
										target="_blank"
										rel="noopener noreferrer"
										className="block w-full text-center p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
									>
										View on Amazon
									</a>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			<button
				onClick={onStartOver}
				className="mt-8 w-full p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
			>
				Start Over
			</button>
		</div>
	);
}
