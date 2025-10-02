import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import os
from datetime import datetime
from automation.cipc_runner import CIPCRunner

@pytest.fixture
def runner():
    return CIPCRunner()

@pytest.mark.asyncio
@patch('automation.cipc_runner.async_playwright')
async def test_successful_annual_return(mock_playwright, runner):
    """Test successful annual return filing."""
    mock_instance = AsyncMock()
    mock_playwright.return_value.start.return_value.__aenter__.return_value = mock_instance
    mock_browser = AsyncMock()
    mock_page = AsyncMock()
    mock_instance.chromium.launch.return_value.__aenter__.return_value = mock_browser
    mock_browser.new_page.return_value.__aenter__.return_value = mock_page
    mock_page.goto.return_value = None

    client_data = {"company_name": "Test Co", "reg_number": "123456"}
    result = await runner.file_annual_return(client_data)

    assert result["status"] == "success"
    assert "reference_number" in result
    assert result["service_type"] == "annual_return"
    assert result["company"] == "Test Co"

@pytest.mark.asyncio
@patch('automation.cipc_runner.async_playwright')
async def test_error_handling_incorrect_data(mock_playwright, runner):
    """
    Test CRA-06: Error handling for incorrect data (e.g., validation error during form filling).
    """
    mock_instance = AsyncMock()
    mock_playwright.return_value.start.return_value.__aenter__.return_value = mock_instance
    mock_browser = AsyncMock()
    mock_page = AsyncMock()
    mock_instance.chromium.launch.return_value.__aenter__.return_value = mock_browser
    mock_browser.new_page.return_value.__aenter__.return_value = mock_page
    # Simulate exception during form filling (incorrect data)
    mock_page.goto.side_effect = Exception("Invalid data: turnover must be numeric")

    client_data = {"company_name": "Test Co", "turnover": "invalid"}
    result = await runner.file_annual_return(client_data)

    assert result["status"] == "failed"
    assert "error" in result
    assert "Invalid data" in result["error"]
    assert result["service_type"] == "annual_return"

@pytest.mark.asyncio
@patch('automation.cipc_runner.async_playwright')
async def test_error_handling_timeout(mock_playwright, runner):
    """
    Test CRA-06: Error handling for timeout (e.g., slow portal load).
    """
    mock_instance = AsyncMock()
    mock_playwright.return_value.start.return_value.__aenter__.return_value = mock_instance
    mock_browser = AsyncMock()
    mock_page = AsyncMock()
    mock_instance.chromium.launch.return_value.__aenter__.return_value = mock_browser
    mock_browser.new_page.return_value.__aenter__.return_value = mock_page
    # Simulate timeout
    mock_page.goto.side_effect = asyncio.TimeoutError("Navigation timeout")

    client_data = {"company_name": "Test Co"}
    result = await runner.file_annual_return(client_data)

    assert result["status"] == "failed"
    assert "error" in result
    assert "TimeoutError" in result["error"]
    assert result["service_type"] == "annual_return"

@pytest.mark.asyncio
@patch('automation.cipc_runner.async_playwright')
async def test_error_handling_invalid_response(mock_playwright, runner):
    """
    Test CRA-06: Error handling for invalid response (e.g., unexpected page content).
    """
    mock_instance = AsyncMock()
    mock_playwright.return_value.start.return_value.__aenter__.return_value = mock_instance
    mock_browser = AsyncMock()
    mock_page = AsyncMock()
    mock_instance.chromium.launch.return_value.__aenter__.return_value = mock_browser
    mock_browser.new_page.return_value.__aenter__.return_value = mock_page
    mock_page.goto.return_value = None
    # Simulate invalid response by raising exception on form interaction
    mock_page.query_selector.side_effect = Exception("Invalid response: form not found")

    client_data = {"company_name": "Test Co"}
    result = await runner.file_annual_return(client_data)

    assert result["status"] == "failed"
    assert "error" in result
    assert "Invalid response" in result["error"]
    assert result["service_type"] == "annual_return"

@pytest.mark.asyncio
async def test_error_handling_connection_failure(runner):
    """
    Test CRA-06: Error handling for connection failure (e.g., network issue).
    """
    with patch('automation.cipc_runner.async_playwright') as mock_playwright:
        mock_playwright.return_value.start.side_effect = ConnectionError("Failed to connect")
        client_data = {"company_name": "Test Co"}
        result = await runner.file_annual_return(client_data)

        assert result["status"] == "failed"
        assert "error" in result
        assert "ConnectionError" in result["error"]
        assert result["service_type"] == "annual_return"

@pytest.mark.asyncio
@patch('automation.cipc_runner.async_playwright')
async def test_beneficial_ownership_success(mock_playwright, runner):
    """Test successful beneficial ownership filing."""
    mock_instance = AsyncMock()
    mock_playwright.return_value.start.return_value.__aenter__.return_value = mock_instance
    mock_browser = AsyncMock()
    mock_page = AsyncMock()
    mock_instance.chromium.launch.return_value.__aenter__.return_value = mock_browser
    mock_browser.new_page.return_value.__aenter__.return_value = mock_page
    mock_page.goto.return_value = None

    client_data = {"company_name": "Test Co"}
    result = await runner.file_beneficial_ownership(client_data)

    assert result["status"] == "success"
    assert "reference_number" in result
    assert result["service_type"] == "beneficial_ownership"
    assert result["company"] == "Test Co"