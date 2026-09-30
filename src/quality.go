package src

type QualityEvaluation struct {
	ID string `json:"id"`

	RelevanceScore   int  `json:"relevance_score"`
	HelpfulnessScore int  `json:"helpfulness_score"`
	LanguageScore    int  `json:"language_score"`
	UnsupportedClaim bool `json:"unsupported_claim"`

	Notes string `json:"notes"`
}
