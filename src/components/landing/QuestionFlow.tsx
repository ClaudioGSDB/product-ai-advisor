// src/components/landing/QuestionFlow.tsx
import { useState } from "react";

interface Question {
	question: string;
	type: "multiple_choice" | "open_ended" | "boolean";
	options?: string[];
}

interface QuestionFlowProps {
	productQuery: string;
	questions: Question[];
	budgetFeedback: string;
	onSubmit: (answers: Record<string, string>) => void;
}

export default function QuestionFlow({
	productQuery,
	questions,
	budgetFeedback,
	onSubmit,
}: QuestionFlowProps) {
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleAnswerChange = (questionIndex: number, answer: string) => {
		setAnswers({
			...answers,
			[questionIndex]: answer,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		onSubmit(answers);
	};

	// Check if all questions have been answered
	const isComplete =
		questions.length > 0 &&
		questions.every((_, index) => answers[index] !== undefined);

	return (
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

			<form onSubmit={handleSubmit}>
				{questions.map((question, index) => (
					<div key={index} className="mb-6 p-4 bg-gray-50 rounded-md">
						<p className="font-medium mb-3">{question.question}</p>

						{question.type === "multiple_choice" &&
							question.options && (
								<div className="space-y-2">
									{question.options.map(
										(option, optionIndex) => (
											<label
												key={optionIndex}
												className="flex items-start space-x-2"
											>
												<input
													type="radio"
													name={`question-${index}`}
													value={option}
													checked={
														answers[index] ===
														option
													}
													onChange={() =>
														handleAnswerChange(
															index,
															option
														)
													}
													className="mt-0.5"
												/>
												<span>{option}</span>
											</label>
										)
									)}
								</div>
							)}

						{question.type === "boolean" && (
							<div className="flex space-x-4">
								<label className="flex items-center space-x-2">
									<input
										type="radio"
										name={`question-${index}`}
										value="Yes"
										checked={answers[index] === "Yes"}
										onChange={() =>
											handleAnswerChange(index, "Yes")
										}
									/>
									<span>Yes</span>
								</label>
								<label className="flex items-center space-x-2">
									<input
										type="radio"
										name={`question-${index}`}
										value="No"
										checked={answers[index] === "No"}
										onChange={() =>
											handleAnswerChange(index, "No")
										}
									/>
									<span>No</span>
								</label>
							</div>
						)}

						{question.type === "open_ended" && (
							<input
								type="text"
								value={answers[index] || ""}
								onChange={(e) =>
									handleAnswerChange(index, e.target.value)
								}
								placeholder="Your answer..."
								className="w-full p-2 border border-gray-300 rounded-md"
							/>
						)}
					</div>
				))}

				<button
					type="submit"
					className="mt-6 w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
					disabled={isSubmitting || !isComplete}
				>
					{isSubmitting
						? "Finding Products..."
						: "Find Recommendations"}
				</button>
			</form>
		</div>
	);
}
