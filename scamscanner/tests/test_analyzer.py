import pytest
from unittest.mock import AsyncMock, patch
from scamscanner.services.analyzer import WebsiteAnalyzer


@pytest.mark.asyncio
async def test_analyze_content_success():
    analyzer = WebsiteAnalyzer()
    db_session = AsyncMock()
    with patch(
        "scamscanner.services.analyzer.generate_analysis", new_callable=AsyncMock
    ) as mock_generate_analysis:
        mock_generate_analysis.return_value = '{"risk": "high"}'
        result = await analyzer.analyze_content("<html></html>", db_session)
        assert result == '{"risk": "high"}'
        mock_generate_analysis.assert_called_once()


@pytest.mark.asyncio
async def test_analyze_for_secrets_success():
    analyzer = WebsiteAnalyzer()
    db_session = AsyncMock()
    with patch(
        "scamscanner.services.analyzer.generate_analysis", new_callable=AsyncMock
    ) as mock_generate_analysis:
        mock_generate_analysis.return_value = '{"secrets": "found"}'
        result = await analyzer.analyze_for_secrets("<html></html>", db_session)
        assert result == '{"secrets": "found"}'
        mock_generate_analysis.assert_called_once()
