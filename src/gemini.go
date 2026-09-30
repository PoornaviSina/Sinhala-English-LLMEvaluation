package src

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
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

	// Maximum number of attempts
	maxAttempts := 3

	for attempt := 1; attempt <= maxAttempts; attempt++ {

		req, err := http.NewRequest(
			"POST",
			url,
			bytes.NewBuffer(jsonData),
		)

		if err != nil {
			return "", err
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-goog-api-key", apiKey)

		client := &http.Client{
			Timeout: 60 * time.Second,
		}

		resp, err := client.Do(req)

		if err != nil {
			if attempt < maxAttempts {
				fmt.Printf(
					"Request failed. Retrying (%d/%d)...\n",
					attempt,
					maxAttempts,
				)

				time.Sleep(time.Duration(attempt*2) * time.Second)
				continue
			}

			return "", err
		}

		body, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()

		if readErr != nil {
			return "", readErr
		}

		// Successful request
		if resp.StatusCode == http.StatusOK {

			var geminiResponse GeminiResponse

			err = json.Unmarshal(body, &geminiResponse)
			if err != nil {
				return "", err
			}

			if len(geminiResponse.Candidates) == 0 ||
				len(geminiResponse.Candidates[0].Content.Parts) == 0 {

				return "", fmt.Errorf(
					"Gemini returned no response",
				)
			}

			return geminiResponse.Candidates[0].
				Content.Parts[0].Text, nil
		}

		// Retry temporary errors:
		// 429 = rate limit
		// 500/502/503/504 = temporary server problems
		if resp.StatusCode == 429 ||
			resp.StatusCode == 500 ||
			resp.StatusCode == 502 ||
			resp.StatusCode == 503 ||
			resp.StatusCode == 504 {

			if attempt < maxAttempts {

				fmt.Printf(
					"Temporary Gemini API error (%d). Retrying (%d/%d)...\n",
					resp.StatusCode,
					attempt,
					maxAttempts,
				)

				// Simple increasing delay:
				// attempt 1 -> 2 seconds
				// attempt 2 -> 4 seconds
				time.Sleep(
					time.Duration(attempt*2) * time.Second,
				)

				continue
			}
		}

		// Permanent error or all retries failed
		return "", fmt.Errorf(
			"Gemini API error after %d attempt(s): status %d: %s",
			attempt,
			resp.StatusCode,
			string(body),
		)
	}

	return "", fmt.Errorf(
		"Gemini request failed after %d attempts",
		maxAttempts,
	)
}
