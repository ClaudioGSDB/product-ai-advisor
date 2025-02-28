"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FollowUpQuestionsProps {
	question: string;
	options?: string[]; // Only provided for multiple choice questions
	onSubmit: (answer: string) => void;
	isLoading: boolean;
}

export default function FollowUpQuestions({
	question,
	options,
	onSubmit,
	isLoading,
}: FollowUpQuestionsProps) {
	const [textAnswer, setTextAnswer] = useState("");

	const handleTextSubmit = () => {
		if (textAnswer.trim()) {
			onSubmit(textAnswer);
			setTextAnswer("");
		}
	};

	return (
		<Card className="p-5 border border-gray-200 dark:border-gray-800">
			<div className="mb-4">
				<h3 className="text-lg font-medium mb-2">{question}</h3>
			</div>

			{/* Multiple choice UI */}
			{options && options.length > 0 ? (
				<div className="flex flex-col gap-2">
					{options.map((option, index) => (
						<Button
							key={index}
							variant="outline"
							className="justify-start h-auto py-3 px-4 font-normal text-left"
							onClick={() => onSubmit(option)}
							disabled={isLoading}
						>
							{option}
						</Button>
					))}
				</div>
			) : (
				/* Text input UI */
				<div className="flex flex-col gap-3">
					<Input
						placeholder="Type your answer..."
						value={textAnswer}
						onChange={(e) => setTextAnswer(e.target.value)}
						onKeyDown={(e) =>
							e.key === "Enter" && handleTextSubmit()
						}
						disabled={isLoading}
					/>
					<Button
						onClick={handleTextSubmit}
						disabled={isLoading || !textAnswer.trim()}
						className="w-full"
					>
						{isLoading ? "Submitting..." : "Submit"}
					</Button>
				</div>
			)}
		</Card>
	);
}
