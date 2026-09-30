package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type QualityReviewItem struct {
	ID               string `json:"id"`
	Category         string `json:"category"`
	Difficulty       string `json:"difficulty"`
	Input            string `json:"input"`
	ExpectedIntent   string `json:"expected_intent"`
	PredictedIntent  string `json:"predicted_intent"`
	ExpectedResponse string `json:"expected_response"`
	ActualResponse   string `json:"actual_response"`

	RelevanceScore   *int   `json:"relevance_score"`
	HelpfulnessScore *int   `json:"helpfulness_score"`
	LanguageScore    *int   `json:"language_score"`
	UnsupportedClaim *bool  `json:"unsupported_claim"`
	Notes            string `json:"notes"`
}

type Score struct {
	Relevance   int
	Helpfulness int
	Language    int
	Unsupported bool
	Notes       string
}

const reviewFile = "results/quality_reviews.json"

func main() {
	scores := buildScores()

	data, err := os.ReadFile(reviewFile)
	if err != nil {
		fmt.Println("Error reading review file:", err)
		return
	}

	var reviews []QualityReviewItem

	if err := json.Unmarshal(data, &reviews); err != nil {
		fmt.Println("Error parsing review file:", err)
		return
	}

	updated := 0
	skipped := 0

	for i := range reviews {
		// Preserve manually reviewed TC001-TC003.
		if reviews[i].RelevanceScore != nil ||
			reviews[i].HelpfulnessScore != nil ||
			reviews[i].LanguageScore != nil ||
			reviews[i].UnsupportedClaim != nil {

			fmt.Printf("%s already reviewed - preserved.\n", reviews[i].ID)
			skipped++
			continue
		}

		score, exists := scores[reviews[i].ID]
		if !exists {
			fmt.Printf("%s has no recommended score - skipped.\n", reviews[i].ID)
			continue
		}

		reviews[i].RelevanceScore = intPointer(score.Relevance)
		reviews[i].HelpfulnessScore = intPointer(score.Helpfulness)
		reviews[i].LanguageScore = intPointer(score.Language)
		reviews[i].UnsupportedClaim = boolPointer(score.Unsupported)
		reviews[i].Notes = score.Notes

		updated++
		fmt.Printf("%s scored.\n", reviews[i].ID)
	}

	output, err := json.MarshalIndent(reviews, "", "  ")
	if err != nil {
		fmt.Println("Error creating JSON:", err)
		return
	}

	if err := os.WriteFile(reviewFile, output, 0644); err != nil {
		fmt.Println("Error saving review file:", err)
		return
	}

	fmt.Println()
	fmt.Println("=======================================")
	fmt.Println("Quality scoring completed.")
	fmt.Printf("Newly scored: %d\n", updated)
	fmt.Printf("Existing reviews preserved: %d\n", skipped)
	fmt.Printf("Saved to: %s\n", reviewFile)
}

func buildScores() map[string]Score {
	return map[string]Score{
		"TC004": {2, 2, 1, true, "Relevant and helpful, but responds only in English to a code-mixed input and implies access to order-status data."},
		"TC005": {2, 2, 2, true, "Handles noisy English correctly, but implies it can check the customer's order status."},

		"TC006": {2, 2, 1, true, "Correctly understands cancellation, but answers a Sinhala request entirely in English and implies it can process the cancellation."},
		"TC007": {2, 2, 2, true, "Relevant response, but claims it can cancel the order despite having no connected order-management system."},
		"TC008": {2, 2, 1, true, "Relevant, but switches from Singlish to English and implies it can process the cancellation."},
		"TC009": {2, 2, 1, true, "Relevant, but does not preserve the code-mixed language style and implies it can process the cancellation."},
		"TC010": {2, 2, 2, true, "Understands noisy cancellation request, but implies it can process the cancellation."},

		"TC011": {2, 2, 2, false, "Relevant Sinhala response that appropriately requests the order ID and return reason."},
		"TC012": {2, 2, 2, false, "Relevant and appropriately asks for information needed to assist with a return."},
		"TC013": {2, 2, 1, false, "Relevant and helpful, but responds entirely in English to a Singlish request."},
		"TC014": {2, 2, 1, false, "Relevant and helpful, but switches from code-mixed language to English."},
		"TC015": {2, 2, 2, false, "Correctly handles the noisy return request and asks for relevant information."},

		"TC016": {2, 2, 1, true, "Relevant, but contains malformed mixed-script wording and implies that the assistant can carry out the refund process."},
		"TC017": {2, 2, 2, false, "Relevant and appropriately requests the order number and refund reason."},
		"TC018": {2, 2, 1, false, "Relevant, but answers the Singlish request entirely in English."},
		"TC019": {2, 2, 1, false, "Relevant and helpful, but does not preserve the code-mixed language style."},
		"TC020": {2, 2, 2, false, "Correctly handles the noisy refund request and requests useful information."},

		"TC021": {2, 2, 1, false, "Relevant and helpful, but unexpectedly inserts non-Sinhala Hindi-script text into the Sinhala response."},
		"TC022": {2, 2, 2, false, "Provides relevant and reasonable payment troubleshooting steps without claiming access to payment data."},
		"TC023": {2, 2, 1, false, "Provides useful troubleshooting, but answers a Singlish request entirely in English."},
		"TC024": {2, 2, 1, false, "Relevant troubleshooting response, but does not preserve the code-mixed language style."},
		"TC025": {2, 2, 2, true, "Relevant, but saying it can look into the payment issue implies access to transaction or order information."},

		"TC026": {2, 2, 1, false, "Relevant response requesting useful evidence, but the Sinhala contains malformed mixed-script text."},
		"TC027": {2, 2, 2, true, "Relevant and helpful, but claims a replacement or refund can be arranged without a connected business system."},
		"TC028": {2, 2, 1, false, "Relevant and helpful, but responds to Singlish entirely in English."},
		"TC029": {2, 2, 1, false, "Relevant and helpful, but responds to a code-mixed request entirely in English."},
		"TC030": {2, 2, 2, false, "Correctly understands the noisy damaged-item request and asks for useful supporting information."},

		"TC031": {2, 2, 2, false, "Relevant Sinhala response that requests the order number and a photo to help resolve the wrong-item issue."},
		"TC032": {2, 2, 2, true, "Relevant, but implies that the assistant can arrange delivery of the correct item."},
		"TC033": {2, 2, 1, true, "Relevant, but switches from Singlish to English and implies it can arrange the correct item."},
		"TC034": {2, 2, 1, true, "Relevant, but switches from code-mixed language to English and implies it can arrange a corrected delivery."},
		"TC035": {2, 2, 2, true, "Correctly handles noisy input, but implies it can arrange the correct replacement item."},

		"TC036": {2, 2, 2, true, "Relevant Sinhala response, but states that the assistant will check the parcel and report back despite having no delivery-system access."},
		"TC037": {2, 2, 2, true, "Relevant and helpful, but implies it can check live delivery status."},
		"TC038": {2, 2, 1, true, "Relevant, but answers Singlish in English and implies access to delivery-status information."},
		"TC039": {2, 2, 1, true, "Relevant, but answers a code-mixed request in English and implies it can check live status."},
		"TC040": {2, 2, 2, true, "Correctly handles noisy input, but implies access to delivery-status information."},

		"TC041": {2, 2, 1, true, "Relevant, but contains awkward mixed-script wording and implies that providing the details is sufficient to change the address."},
		"TC042": {2, 2, 2, true, "Claims the address can be changed and that the assistant can update it, despite having no order-management access."},
		"TC043": {2, 2, 1, true, "Relevant, but answers Singlish in English and claims it can update the delivery address."},
		"TC044": {2, 2, 1, true, "Relevant, but answers code-mixed input in English and claims it can update the address."},
		"TC045": {2, 2, 2, false, "Relevant and appropriately requests the order ID and new address without explicitly claiming the update was performed."},

		"TC046": {2, 2, 2, true, "Relevant Sinhala response, but implies access to product availability information that is not connected to the assistant."},
		"TC047": {2, 1, 2, true, "Relevant, but begins with an unsupported 'Yes' before the product is identified and implies it can check inventory."},
		"TC048": {2, 2, 2, true, "Responds naturally in Singlish, but implies it can check product colour availability without inventory access."},
		"TC049": {2, 1, 1, true, "The response says 'Yes' before knowing the product, switches away from the code-mixed style, and implies inventory access."},
		"TC050": {2, 1, 2, true, "Understands the noisy request, but says 'Yes' without product context and implies it can check size availability."},

		"TC051": {2, 2, 1, false, "Relevant, but the Sinhala response contains unexpected non-Sinhala characters, reducing language quality."},
		"TC052": {2, 2, 2, true, "Helpful password-reset guidance, but assumes a Forgot Password link exists even though that interface was not provided."},
		"TC053": {2, 2, 1, false, "Relevant and helpful, but answers a Singlish request entirely in English."},
		"TC054": {2, 2, 1, false, "Relevant and helpful, but does not preserve the user's code-mixed language style."},
		"TC055": {2, 2, 2, false, "Correctly handles the noisy account-access request and asks for relevant information."},

		"TC056": {2, 2, 2, false, "Relevant Sinhala complaint response that acknowledges dissatisfaction and asks for more details."},
		"TC057": {2, 2, 2, false, "Relevant, empathetic, and appropriately asks for details about the complaint."},
		"TC058": {2, 2, 1, false, "Relevant and empathetic, but answers a Singlish complaint entirely in English."},
		"TC059": {2, 2, 1, false, "Relevant and empathetic, but does not preserve the code-mixed language style."},
		"TC060": {2, 2, 2, false, "Correctly understands noisy complaint text and responds appropriately."},
	}
}

func intPointer(value int) *int {
	return &value
}

func boolPointer(value bool) *bool {
	return &value
}
