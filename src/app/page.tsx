"use client";
import { useState } from "react";
import { validateBudget, generateQuestions } from "@/services/ai-service/ai-service";
import SearchInput from "@/components/searchInput/SearchInput";
import Questions from "@/components/questions/Questions";

export default function Home() {
	const [step, setStep] = useState("search"); // 'search', 'questions', 'results'
	const [productQuery, setProductQuery] = useState("");
	const [budget, setBudget] = useState(0);
	const [budgetFeedback, setBudgetFeedback] = useState("");
	const [questions, setQuestions] = useState([]);

	const handleSearch = async (query: string, budgetAmount: number) => {
		setProductQuery(query);
		setBudget(budgetAmount);

		const generatedQuestions = await generateQuestions(query, budgetAmount);
		setQuestions(generatedQuestions);
		setStep("questions");
	};

	const handleFormSubmit = async (answers: Record<string, string>) => {
		setStep("results");
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

						{/* Here we'll add the questions component */}
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
						<p>Results will appear here</p>

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
