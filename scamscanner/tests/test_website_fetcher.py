import pytest
import aiohttp
from unittest.mock import AsyncMock, patch, MagicMock
from scamscanner.services.website_fetcher import WebsiteFetcher
from scamscanner.exceptions import WebsiteFetchError


@pytest.mark.asyncio
async def test_fetch_url_content_success():
    """
    Tests that the fetch_url_content method returns the content of the URL when
    the request is successful.
    """
    wsman = AsyncMock()
    fetcher = WebsiteFetcher("http://example.com", "job_id", wsman)

    with patch("aiohttp.ClientSession.get") as mock_get:
        mock_response = AsyncMock()
        mock_response.text.return_value = "<html></html>"
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value.__aenter__.return_value = mock_response

        content = await fetcher.fetch_url_content("http://example.com")
        assert content == "<html></html>"


@pytest.mark.asyncio
async def test_fetch_url_content_failure():
    """
    Tests that the fetch_url_content method raises a WebsiteFetchError when the
    request fails.
    """
    wsman = AsyncMock()
    fetcher = WebsiteFetcher("http://example.com", "job_id", wsman)

    with patch("aiohttp.ClientSession.get") as mock_get:
        mock_response = AsyncMock()
        mock_response.raise_for_status = MagicMock(
            side_effect=aiohttp.ClientError("Failed to fetch")
        )
        mock_get.return_value.__aenter__.return_value = mock_response

        with pytest.raises(WebsiteFetchError):
            await fetcher.fetch_url_content("http://example.com")
