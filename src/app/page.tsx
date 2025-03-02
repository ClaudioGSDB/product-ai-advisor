"use client";
import { useState } from "react";
import {
	validateBudget,
	generateQuestions,
} from "@/services/ai-service/ai-service";
import SearchInput from "@/components/landing/SearchInput";
import QuestionFlow from "@/components/landing/QuestionFlow";
import QuestionResults from "@/components/landing/QuestionResults";

// Define Question type
interface Question {
	question: string;
	type: "multiple_choice" | "open_ended" | "boolean";
	options?: string[];
}

export default function Home() {
	const [step, setStep] = useState("search"); // 'search', 'questions', 'results'
	const [productQuery, setProductQuery] = useState("");
	const [budget, setBudget] = useState(0);
	const [budgetFeedback, setBudgetFeedback] = useState("");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);

	const handleSearch = async (query: string, budgetAmount: number) => {
		setIsLoading(true);
		setProductQuery(query);
		setBudget(budgetAmount);

		try {
			const generatedQuestions = await generateQuestions(
				query,
				budgetAmount
			);
			setQuestions(generatedQuestions);
			setStep("questions");
		} catch (error) {
			console.error("Error generating questions:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleQuestionsSubmit = async (answers: Record<string, string>) => {
		setIsLoading(true);
		setUserAnswers(answers);

		try {
			// Now that we have specific requirements, validate the budget
			if (budget > 0) {
				const validation = await validateBudget(productQuery, budget);
				setBudgetFeedback(validation);
			}

			// Move to results step
			setStep("results");
		} catch (error) {
			console.error("Error processing answers:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleStartOver = () => {
		setStep("search");
		setProductQuery("");
		setBudget(0);
		setBudgetFeedback("");
		setQuestions([]);
		setUserAnswers({});
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-4xl mx-auto px-4">
				{step === "search" && (
					<SearchInput
						onSearch={handleSearch}
						isLoading={isLoading}
					/>
				)}

				{step === "questions" && (
					<QuestionFlow
						productQuery={productQuery}
						questions={questions}
						budgetFeedback={budgetFeedback}
						onSubmit={handleQuestionsSubmit}
					/>
				)}

				{step === "results" && (
					<QuestionResults
						productQuery={productQuery}
						budget={budget}
						userAnswers={userAnswers}
						onStartOver={handleStartOver}
					/>
				)}
			</div>
		</div>
	);
}
