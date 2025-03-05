import { useState } from "react";

interface SearchInputProps {
	onSearch: (query: string, budget: number) => void;
}

export default function SearchInput({ onSearch }: SearchInputProps) {
	const [query, setQuery] = useState("");
	const [budget, setBudget] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		onSearch(query, parseInt(budget) || 0);
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4">Amazon AI Advisor</h1>
			<p className="mb-4 text-gray-600">
				Tell me what you're looking for and your budget, and I'll help
				you find the perfect product.
			</p>
			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label
						htmlFor="query"
						className="block mb-2 text-sm font-medium"
					>
						What are you looking for?
					</label>
					<input
						id="query"
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full p-3 border border-gray-300 rounded-md"
						placeholder="e.g., gaming laptop, running shoes, coffee maker"
						required
					/>
				</div>

				<div className="mb-4">
					<label
						htmlFor="budget"
						className="block mb-2 text-sm font-medium"
					>
						Your budget (optional)
					</label>
					<div className="relative">
						<span className="absolute left-3 top-3">$</span>
						<input
							id="budget"
							type="number"
							value={budget}
							onChange={(e) => setBudget(e.target.value)}
							className="w-full p-3 pl-7 border border-gray-300 rounded-md"
							placeholder="Enter amount"
						/>
					</div>
				</div>

				<button
					type="submit"
					className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
					disabled={isLoading || !query}
				>
					{isLoading ? "Loading..." : "Find Products"}
				</button>
			</form>
		</div>
	);
}
