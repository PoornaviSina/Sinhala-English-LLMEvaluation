package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/PoornaviSina/Sinhala-English-LLMEvaluation/src"
)

func main() {
	fmt.Println("Resume Failed LLM Evaluations")
	fmt.Println("=============================")

	results, err := src.LoadResults(
		"results/evaluation_results.json",
	)
	if err != nil {
		fmt.Println("Error loading results:", err)
		return
	}

	failedCount := 0

	for _, result := range results {
		if result.PredictedIntent == "API_ERROR" {
			failedCount++
		}
	}

	fmt.Printf("Found %d API-error test cases.\n\n", failedCount)

	if failedCount == 0 {
		fmt.Println("No API-error cases need to be rerun.")
		return
	}

	completed := 0

	for i := range results {

		if results[i].PredictedIntent != "API_ERROR" {
			continue
		}

		completed++

		fmt.Println("----------------------------------------")
		fmt.Printf(
			"[%d/%d] Retrying %s\n",
			completed,
			failedCount,
			results[i].ID,
		)

		fmt.Println("Category:", results[i].Category)
		fmt.Println("Difficulty:", results[i].Difficulty)
		fmt.Println("Input:", results[i].Input)

		prompt := buildPrompt(results[i].Input)

		response, err := src.AskGemini(prompt)

		if err != nil {
			fmt.Println("API Error:", err)

			results[i].Error = err.Error()

		} else {

			predictedIntent := extractIntent(response)
			actualResponse := extractResponse(response)

			correct := strings.EqualFold(
				strings.TrimSpace(results[i].ExpectedIntent),
				strings.TrimSpace(predictedIntent),
			)

			results[i].PredictedIntent = predictedIntent
			results[i].ActualResponse = actualResponse
			results[i].Correct = correct
			results[i].Error = ""

			fmt.Println(
				"Expected:",
				results[i].ExpectedIntent,
			)

			fmt.Println(
				"Predicted:",
				predictedIntent,
			)

			if correct {
				fmt.Println("Result: CORRECT")
			} else {
				fmt.Println("Result: INCORRECT")
			}
		}

		err = src.SaveResults(
			"results/evaluation_results.json",
			results,
		)

		if err != nil {
			fmt.Println("Error saving results:", err)
			return
		}

		fmt.Println("Updated result saved.")

		if completed < failedCount {
			time.Sleep(5 * time.Second)
		}
	}

	printSummary(results)
}

func printSummary(results []src.EvaluationResult) {

	correct := 0
	incorrect := 0
	apiErrors := 0

	for _, result := range results {

		if result.PredictedIntent == "API_ERROR" {
			apiErrors++
			continue
		}

		if result.Correct {
			correct++
		} else {
			incorrect++
		}
	}

	successfullyEvaluated := correct + incorrect

	accuracy := 0.0

	if successfullyEvaluated > 0 {
		accuracy =
			(float64(correct) /
				float64(successfullyEvaluated)) * 100
	}

	completionRate := 0.0

	if len(results) > 0 {
		completionRate =
			(float64(successfullyEvaluated) /
				float64(len(results))) * 100
	}

	fmt.Println()
	fmt.Println("========================================")
	fmt.Println("UPDATED EVALUATION SUMMARY")
	fmt.Println("========================================")
	fmt.Println("Total Test Cases:", len(results))
	fmt.Println(
		"Successfully Evaluated:",
		successfullyEvaluated,
	)
	fmt.Println("Correct:", correct)
	fmt.Println("Incorrect:", incorrect)
	fmt.Println("API Errors:", apiErrors)

	fmt.Printf(
		"Intent Accuracy: %.2f%%\n",
		accuracy,
	)

	fmt.Printf(
		"Evaluation Completion Rate: %.2f%%\n",
		completionRate,
	)
}

func buildPrompt(customerMessage string) string {

	return fmt.Sprintf(`
You are a customer support assistant that understands Sinhala,
English, Singlish, and Sinhala-English code-mixed messages.

Classify the customer's message into exactly ONE of these intent labels:

order_status
cancel_order
return_item
refund_request
payment_issue
damaged_item
wrong_item
delivery_issue
change_address
product_inquiry
account_issue
complaint

Intent definitions:

order_status:
The customer asks for the current status or tracking of an order.

cancel_order:
The customer wants to cancel an order.

return_item:
The customer wants to return a purchased item.

refund_request:
The customer wants money refunded.

payment_issue:
The customer reports a payment, card, or transaction problem.

damaged_item:
The customer received an item that is damaged or broken.

wrong_item:
The customer received a different item from what was ordered.

delivery_issue:
The customer explicitly reports a late, missing, failed,
or otherwise problematic delivery.

change_address:
The customer wants to change or correct a delivery address.

product_inquiry:
The customer asks about product information or availability.

account_issue:
The customer reports login, password, or account-access problems.

complaint:
The customer expresses general dissatisfaction that does not
clearly belong to another intent above.

Rules:
- Select exactly ONE intent.
- Use only an intent label listed above.
- Never invent another intent label.
- Do not claim access to order, payment, delivery, or account data
  that has not been provided.
- If information is required to help the customer, ask for it.
- Keep the response short and helpful.

Customer message:
%s

Return exactly:

Intent: <intent_label>
Response: <short helpful response>
`, customerMessage)
}

func extractIntent(response string) string {

	lines := strings.Split(response, "\n")

	for _, line := range lines {

		line = strings.TrimSpace(line)

		if strings.HasPrefix(
			strings.ToLower(line),
			"intent:",
		) {
			return strings.TrimSpace(
				line[len("Intent:"):],
			)
		}
	}

	return "unknown"
}

func extractResponse(response string) string {

	lines := strings.Split(response, "\n")

	for _, line := range lines {

		line = strings.TrimSpace(line)

		if strings.HasPrefix(
			strings.ToLower(line),
			"response:",
		) {
			return strings.TrimSpace(
				line[len("Response:"):],
			)
		}
	}

	return ""
}
