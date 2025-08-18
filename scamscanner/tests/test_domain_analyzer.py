import pytest
from unittest.mock import patch
from scamscanner.services.domain_analyzer import DomainAnalyzer
from datetime import datetime


@pytest.mark.asyncio
async def test_get_domain_info_success():
    analyzer = DomainAnalyzer()

    class MockWhois:
        registrar = "test_registrar"
        creation_date = datetime(2022, 1, 1)
        expiration_date = datetime(2025, 1, 1)

    with patch("whois.whois", return_value=MockWhois()) as mock_whois:
        result = await analyzer.get_domain_info("http://example.com")
        assert result is not None
        assert result["registrar"] == "test_registrar"
        assert "creation_date" in result
        assert "expiration_date" in result
        assert "domain_age_days" in result
        mock_whois.assert_called_once_with("example.com")


@pytest.mark.asyncio
async def test_get_domain_info_failure():
    analyzer = DomainAnalyzer()
    with patch(
        "whois.whois", side_effect=Exception("WHOIS lookup failed")
    ) as mock_whois:
        result = await analyzer.get_domain_info("http://example.com")
        assert result is None
