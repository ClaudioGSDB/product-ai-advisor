import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
	question: string;
	type: "multiple_choice" | "open_ended" | "boolean";
	options?: string[];
}

interface QuestionsProps {
	questionsList: Question[];
	onSubmit: (answers: Record<string, string>) => void;
}

export default function Questions({ questionsList, onSubmit }: QuestionsProps) {
	const [formData, setFormData] = useState<Record<string, string>>({});

	const handleChange = (question: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[question.replace(/\s+/g, "_")]: value,
		}));
	};

	const handleSubmit = () => {
		console.log("Form Data:", formData);
		onSubmit(formData);
	};

	return (
		<div>
			{questionsList.map((question, index) => (
				<div key={index} className="bg-gray-500 mb-4 rounded p-4">
					<div className="mb-2">{question.question}</div>

					{question.type === "multiple_choice" && question.options && (
						<RadioGroup
							onValueChange={(value) =>
								handleChange(question.question, value)
							}
						>
							{question.options.map((option, idx) => (
								<div key={idx} className="flex items-center space-x-2">
									<RadioGroupItem
										id={option}
										value={option}
										checked={
											formData[
												question.question.replace(/\s+/g, "_")
											] === option
										}
										required
									/>
									<Label htmlFor={option} className="cursor-pointer">
										{option}
									</Label>
								</div>
							))}
						</RadioGroup>
					)}

					{question.type === "open_ended" && (
						<input
							type="text"
							className="w-full p-2 bg-gray-300 border rounded"
							value={formData[question.question.replace(/\s+/g, "_")] || ""}
							onChange={(e) =>
								handleChange(question.question, e.target.value)
							}
							required
						/>
					)}

					{question.type === "boolean" && (
						<RadioGroup
							onValueChange={(value) =>
								handleChange(question.question, value)
							}
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem
									id={`true-${index}`}
									value="true"
									checked={
										formData[
											question.question.replace(/\s+/g, "_")
										] === "true"
									}
									required
								/>
								<Label
									htmlFor={`true-${index}`}
									className="cursor-pointer"
								>
									Yes
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem
									id={`false-${index}`}
									value="false"
									checked={
										formData[
											question.question.replace(/\s+/g, "_")
										] === "false"
									}
									required
								/>
								<Label
									htmlFor={`false-${index}`}
									className="cursor-pointer"
								>
									No
								</Label>
							</div>
						</RadioGroup>
					)}
				</div>
			))}

			<button
				onClick={handleSubmit}
				className="mt-6 w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
			>
				Submit
			</button>
		</div>
	);
}
