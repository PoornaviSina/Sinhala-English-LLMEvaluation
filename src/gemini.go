package src

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type GeminiRequest struct {
	Contents []Content `json:"contents"`
}

type Content struct {
	Parts []Part `json:"parts"`
}

type Part struct {
	Text string `json:"text"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []Part `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func AskGemini(prompt string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")

	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY is not set")
	}

	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"

	requestBody := GeminiRequest{
		Contents: []Content{
			{
				Parts: []Part{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", apiKey)

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Gemini API error: %s", string(body))
	}

	var geminiResponse GeminiResponse

	err = json.Unmarshal(body, &geminiResponse)
	if err != nil {
		return "", err
	}

	if len(geminiResponse.Candidates) == 0 ||
		len(geminiResponse.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("Gemini returned no response")
	}

	return geminiResponse.Candidates[0].Content.Parts[0].Text, nil
}