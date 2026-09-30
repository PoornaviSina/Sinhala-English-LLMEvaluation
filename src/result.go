package src

type EvaluationResult struct {
	ID               string `json:"id"`
	Category         string `json:"category"`
	Input            string `json:"input"`
	ExpectedIntent   string `json:"expected_intent"`
	PredictedIntent  string `json:"predicted_intent"`
	ExpectedResponse string `json:"expected_response"`
	ActualResponse   string `json:"actual_response"`
	Difficulty       string `json:"difficulty"`
	Correct          bool   `json:"correct"`
	Error            string `json:"error,omitempty"`
}
