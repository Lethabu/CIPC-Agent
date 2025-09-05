package temporal

import (
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"go.temporal.io/sdk/testsuite"
)

// WebhookWorkflowTestSuite is the test suite for the webhook workflow.
// It uses the Temporal test suite to mock activities and test workflow logic.
type WebhookWorkflowTestSuite struct {
	suite.Suite
	testsuite.WorkflowTestSuite

	env *testsuite.TestWorkflowEnvironment
}

// TestWebhookWorkflowTestSuite runs the test suite.
func TestWebhookWorkflowTestSuite(t *testing.T) {
	suite.Run(t, new(WebhookWorkflowTestSuite))
}

// SetupTest sets up the test environment before each test.
func (s *WebhookWorkflowTestSuite) SetupTest() {
	s.env = s.NewTestWorkflowEnvironment()
}

// AfterTest asserts that all mocks were called as expected.
func (s *WebhookWorkflowTestSuite) AfterTest(suiteName, testName string) {
	s.env.AssertExpectations(s.T())
}

// Test_ProcessWebhookWorkflow_Success tests the happy path for the webhook workflow.
func (s *WebhookWorkflowTestSuite) Test_ProcessWebhookWorkflow_Success() {
	// 1. Mock the input for the workflow
	request := WebhookProcessingRequest{
		Provider:  "paystack",
		Body:      []byte(`{"event":"charge.success"}`),
		Signature: "test-signature",
	}

	// 2. Mock the response from the activity
	activityResponse := &WebhookProcessingResponse{
		Success: true,
		Message: "Webhook processed successfully",
	}

	// 3. Set up the expectation that the activity will be called with the correct request
	s.env.OnActivity(ProcessWebhookActivity, mock.Anything, request).Return(activityResponse, nil)

	// 4. Execute the workflow
	s.env.ExecuteWorkflow(ProcessWebhookWorkflow, request)

	// 5. Assert that the workflow completed successfully and returned the correct result
	s.True(s.env.IsWorkflowCompleted())
	s.NoError(s.env.GetWorkflowError())

	var result WebhookProcessingResponse
	err := s.env.GetWorkflowResult(&result)
	s.NoError(err)
	s.Equal(*activityResponse, result)
}
