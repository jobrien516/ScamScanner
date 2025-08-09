"""
Defines custom exception classes for the ScamScanner application.
"""

class WebsiteFetchError(Exception):
    """
    Custom exception raised when there's an error fetching a website's content.
    This can be due to network issues, HTTP errors (like 403 or 404), or other
    client-side problems.
    """
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)