# Sinhala-English LLM Evaluation Framework

An evaluation framework for assessing a **Sinhala-English code-mixed customer support assistant** powered by a Large Language Model (LLM).

The project evaluates whether an LLM can correctly understand customer-support requests written in **Sinhala, English, Singlish, Sinhala-English code-mixed language, and noisy text**, while also assessing the quality and reliability of the generated responses.

The framework is implemented in **Go (Golang)** and uses the **Gemini API** as the evaluated LLM.

---

## 1. Project Objective

The main objective of this project is to design and implement an evaluation framework for a real-world multilingual customer-support application.

The framework evaluates two major aspects of LLM performance:

1. **Intent Classification Performance**
   - Does the model correctly identify what the customer wants?

2. **Generated Response Quality**
   - Is the response relevant?
   - Is it helpful?
   - Is the language appropriate?
   - Does it make unsupported claims about actions or information that the system cannot actually access?

This distinction is important because an LLM may correctly identify a customer's intent while still generating an unreliable or linguistically inappropriate response.

---

## 2. Application Scenario

The evaluated application is a hypothetical customer-support assistant designed for users who communicate using different forms of Sinhala and English.

Example inputs include:

```text
මගේ order එකේ status එක මොකක්ද?
```

```text
Can you cancel my order?
```

```text
mage order eka cancel karanna puluwanda?
```

```text
I need mage delivery status eka.
```

The framework evaluates how consistently the LLM handles these different language styles.

---

## 3. Technology Stack

- **Go (Golang)**
- **Gemini API**
- **JSON**
- **Git**
- **GitHub**
- **Visual Studio Code**

The Gemini API key is supplied through the `GEMINI_API_KEY` environment variable and is not stored in the repository.

---

## 4. Test Dataset

The evaluation dataset contains **60 independently defined test cases**.

The dataset is balanced across five language categories:

| Language Category | Test Cases |
|---|---:|
| Sinhala | 12 |
| English | 12 |
| Singlish | 12 |
| Code-Mixed | 12 |
| Noisy Text | 12 |
| **Total** | **60** |

The test cases also contain three difficulty levels:

| Difficulty | Test Cases |
|---|---:|
| Easy | 24 |
| Medium | 24 |
| Hard | 12 |
| **Total** | **60** |

---

## 5. Customer Support Intents

The framework evaluates 12 customer-support intents:

1. `order_status`
2. `cancel_order`
3. `return_item`
4. `refund_request`
5. `payment_issue`
6. `damaged_item`
7. `wrong_item`
8. `delivery_issue`
9. `change_address`
10. `product_inquiry`
11. `account_issue`
12. `complaint`

Each intent contains **5 test cases**, giving:

```text
12 intents × 5 cases = 60 test cases
```

---

## 6. Evaluation Pipeline

The evaluation process follows the pipeline:

```text
Test Cases
    ↓
Load JSON Dataset
    ↓
Send Customer Request to Gemini
    ↓
Extract Predicted Intent
    ↓
Capture Generated Response
    ↓
Compare Predicted vs Expected Intent
    ↓
Calculate Classification Metrics
    ↓
Evaluate Response Quality
    ↓
Identify Failure Patterns
    ↓
Generate Evaluation Reports
```

---

## 7. Intent Classification Metrics

The framework calculates:

- Accuracy
- Precision
- Recall
- F1-score
- Macro Precision
- Macro Recall
- Macro F1
- Performance by language category
- Performance by difficulty level

### Final Classification Results

The final completed evaluation produced:

| Metric | Result |
|---|---:|
| Test Cases | 60 |
| Correct Intent Predictions | 60 |
| Incorrect Predictions | 0 |
| Final API Errors | 0 |
| Accuracy | 100.00% |
| Macro Precision | 1.0000 |
| Macro Recall | 1.0000 |
| Macro F1 | 1.0000 |

All five language categories achieved 100% intent-classification accuracy on this evaluation dataset.

These results apply specifically to the designed 60-case evaluation set and should not be interpreted as evidence of universal model accuracy.

---

## 8. Response Quality Evaluation

Correct intent classification does not guarantee that the generated response is suitable for real-world use.

Therefore, each of the 60 generated responses was also reviewed using a structured response-quality rubric.

Three dimensions were scored from **0 to 2**:

### Relevance

- `2` — Fully relevant
- `1` — Partially relevant
- `0` — Not relevant

### Helpfulness

- `2` — Provides useful and appropriate guidance
- `1` — Partially helpful
- `0` — Not helpful

### Language Appropriateness

- `2` — Clear and appropriate for the user's language context
- `1` — Understandable but contains language mismatch or awkward usage
- `0` — Unsuitable or difficult to understand

An additional boolean criterion records whether the response contains an **unsupported capability claim**.

An unsupported capability claim occurs when the response implies that the assistant can access business information or perform an operation that was not available in the experiment, such as checking an order database, modifying an address, verifying a payment, or arranging a replacement.

---

## 9. Response Quality Results

The 60 responses produced the following rubric-based results:

| Quality Metric | Result |
|---|---:|
| Average Relevance | 2.00 / 2 |
| Relevance Score | 100.00% |
| Average Helpfulness | 1.95 / 2 |
| Helpfulness Score | 97.50% |
| Average Language Quality | 1.52 / 2 |
| Language Quality Score | 75.83% |
| Average Total Quality | 5.47 / 6 |
| Overall Quality Score | 91.11% |
| Unsupported Capability Claims | 31 / 60 (51.67%) |

The results demonstrate that strong intent-classification performance does not automatically guarantee reliable generated responses.

---

## 10. Quality by Language Category

| Category | Overall Quality | Unsupported Claims |
|---|---:|---:|
| Code-Mixed | 81.94% | 50.00% |
| English | 98.61% | 66.67% |
| Noisy | 98.61% | 50.00% |
| Singlish | 84.72% | 50.00% |
| Sinhala | 91.67% | 41.67% |

The main reduction in Singlish and code-mixed response quality was associated with language-style mismatches rather than intent-classification errors.

---

## 11. Failure Pattern Analysis

The framework performs a separate analysis of recurring response-quality problems.

| Failure Pattern | Cases | Percentage |
|---|---:|---:|
| Unsupported Capability Claims | 31 / 60 | 51.67% |
| Language Appropriateness Issues | 29 / 60 | 48.33% |
| Reduced Helpfulness | 3 / 60 | 5.00% |
| Rule-Detected Malformed or Mixed-Script Output | 4 / 60 | 6.67% |
| Rule-Detected Premature Product Availability Assumptions | 2 / 60 | 3.33% |

### Key Observations

**Unsupported capability claims**

Some responses implied that the assistant could access or modify business data even though no customer-support backend was connected during the experiment.

**Language appropriateness**

The model frequently understood Singlish and code-mixed requests correctly but did not always respond using an equally appropriate language style.

**Malformed multilingual output**

A small subset of generated responses contained malformed words or unexpected characters from other writing systems.

**Product availability assumptions**

Some product-inquiry responses made premature assumptions about availability despite having no inventory information.

**API reliability**

During the initial 60-case evaluation, two requests encountered temporary API errors. A resume mechanism was used to retry the failed cases without rerunning the successfully completed cases.

---

## 12. Project Structure

```text
Sinhala-English-LLMEvaluation/
│
├── cmd/
│   ├── autoscore/
│   │   └── main.go
│   ├── failureanalysis/
│   │   └── main.go
│   ├── metrics/
│   │   └── main.go
│   ├── quality/
│   │   └── main.go
│   └── qualitymetrics/
│       └── main.go
│
├── data/
│   └── test_cases.json
│
├── docs/
│   └── response_quality_rubric.md
│
├── results/
│   ├── evaluation_results.json
│   ├── evaluation_results_final.json
│   ├── evaluation_results_run1.json
│   ├── failure_analysis_report.txt
│   ├── metrics_report.txt
│   ├── quality_metrics_report.txt
│   └── quality_reviews.json
│
├── src/
│   ├── gemini.go
│   ├── loader.go
│   ├── metrics.go
│   ├── quality.go
│   ├── result.go
│   ├── saver.go
│   └── testcase.go
│
├── .gitignore
├── go.mod
├── main.go
└── README.md
```

---

## 13. Running the Project

### Prerequisites

Install Go and verify the installation:

```powershell
go version
```

Set the Gemini API key in PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

Do not commit the API key to GitHub.

### Validate the Project

```powershell
go test ./...
```

### Calculate Intent Classification Metrics

```powershell
go run ./cmd/metrics
```

### Review Response Quality

```powershell
go run ./cmd/quality
```

### Calculate Response Quality Metrics

```powershell
go run ./cmd/qualitymetrics
```

### Run Failure Pattern Analysis

```powershell
go run ./cmd/failureanalysis
```

---

## 14. Evaluation Outputs

The project preserves several evaluation artifacts for reproducibility.

### `evaluation_results_run1.json`

Contains the initial evaluation run, including temporary API failures.

### `evaluation_results_final.json`

Contains the completed 60-case evaluation after failed API requests were successfully retried.

### `metrics_report.txt`

Contains intent-classification metrics.

### `quality_reviews.json`

Contains the rubric-based review of all generated responses.

### `quality_metrics_report.txt`

Contains aggregated response-quality statistics.

### `failure_analysis_report.txt`

Contains recurring failure patterns and affected test-case IDs.

---

## 15. Limitations

The evaluation has several important limitations.

- The dataset contains 60 test cases and therefore represents a controlled evaluation rather than all possible real-world customer interactions.
- Many test cases have intentionally clear expected intents.
- The dataset does not extensively test ambiguous or multi-intent customer requests.
- Response-quality scoring contains human judgment based on the defined rubric.
- The assistant was not connected to a real order, payment, delivery, account, or inventory backend.
- API availability and rate limits can affect evaluation execution independently of model quality.
- The results are specific to the model and evaluation configuration used during this experiment.

Therefore, the 100% intent-classification accuracy should be interpreted as performance on this evaluation dataset rather than universal LLM performance.

---

## 16. Future Improvements

Possible future extensions include:

- Adding ambiguous and adversarial test cases
- Adding multi-intent customer requests
- Increasing the number of Sinhala and Singlish linguistic variations
- Testing multiple LLMs using the same dataset
- Adding semantic similarity metrics
- Evaluating response latency and token usage
- Integrating a real customer-support backend
- Testing whether stronger system prompts reduce unsupported capability claims
- Adding automated multilingual language-quality evaluation

---

## Conclusion

The evaluation demonstrates that the tested LLM can identify the intended customer-support category across the designed Sinhala-English multilingual dataset with high consistency.

However, the response-quality analysis reveals that **correct intent recognition alone is insufficient for evaluating an LLM-based customer-support system**. Language appropriateness, unsupported capability claims, helpfulness, API reliability, and multilingual generation quality must also be evaluated before such a system is considered suitable for practical deployment.