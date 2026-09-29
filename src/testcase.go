package src

type TestCase struct {
	ID               string `json:"id"`
	Category         string `json:"category"`
	Input            string `json:"input"`
	ExpectedIntent   string `json:"expected_intent"`
	ExpectedResponse string `json:"expected_response"`
	Difficulty       string `json:"difficulty"`
}