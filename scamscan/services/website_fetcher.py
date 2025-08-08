import aiohttp
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup, Tag
from sqlalchemy.future import select
from loguru import logger
# from services.db import DbManager
from models.schemas import SiteDB
from models.exceptions import WebsiteFetchError
from models.constants import DEMO_SITES


class WebsiteFetcher:
    def __init__(self, url):
        self.url = url
        self.visited_urls = set()
        self.urls_to_visit = [url]
        self.domain_name = urlparse(url).netloc

    async def fetch_website_html(self):
        normalized_url = (
            str(self.url)
            .strip()
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "")
            .rstrip("/")
        )

        if normalized_url in DEMO_SITES:
            logger.info(f"Fetching demo site: {normalized_url}")
            return DEMO_SITES[normalized_url]

        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(self.url) as response:
                    response.raise_for_status()
                    html_content = await response.text()
                    logger.info(f"Fetched HTML content from {self.url}")
                    return html_content
            except aiohttp.ClientError as e:
                logger.error(f"Error fetching {self.url}: {e}")
                raise WebsiteFetchError(
                    f"Failed to fetch HTML content from {self.url}: {e}"
                )

    # async def save_to_db(self, current_url, html):
    #     db_manager: DbManager = DbManager()
    #     session = await db_manager.get_conn()
    #     if session:
    #         async with session as db:
    #             try:
    #                 result = await db.execute(
    #                     select(SiteDB).where(SiteDB.url == current_url)
    #                 )
    #                 site = result.scalar_one_or_none()
    #                 if site:
    #                     site.html = html
    #                 else:
    #                     site = SiteDB(url=current_url, html=html)
    #                     db.add(site)
    #                 await db.commit()
    #             except Exception as e:
    #                 logger.error(f"You fucked up: {e}")
    #     else:
    #         logger.error("You no active session")

    async def download_site(self):
        async with aiohttp.ClientSession() as session:
            while self.urls_to_visit:
                current_url = self.urls_to_visit.pop(0)

                if current_url in self.visited_urls:
                    continue

                self.visited_urls.add(current_url)
                logger.info(f"Downloading: {current_url}")

                html = await self.fetch_website_html()
                if html is None:
                    continue

                # await self.save_to_db(current_url, html)

                soup = BeautifulSoup(html, "html.parser")
                for tag in soup.find_all(["a", "link", "script", "img"]):
                    if isinstance(tag, Tag):
                        attr = "href" if tag.name in ["a", "link"] else "src"
                        if tag.has_attr(attr):
                            link_url = str(tag[attr])
                            absolute_url = urljoin(current_url, link_url)
                            if (
                                urlparse(absolute_url).netloc == self.domain_name
                                and absolute_url not in self.visited_urls
                            ):
                                self.urls_to_visit.append(absolute_url)

        logger.info("\nDownload complete.")


# Usage example:
# fetcher = WebsiteFetcher('http://example.com')
# asyncio.run(fetcher.download_site())

# async def download_site(url, output_dir='downloaded_sites/'):
#     visited_urls = set()
#     urls_to_visit = [url]

#     if not os.path.exists(output_dir):
#         os.makedirs(output_dir)

#     domain_name = urlparse(url).netloc

#     async with aiohttp.ClientSession() as session:
#         while urls_to_visit:
#             current_url = urls_to_visit.pop(0)

#             if current_url in visited_urls:
#                 continue

#             visited_urls.add(current_url)
#             print(f"Downloading: {current_url}")

#             html = await fetch(session, current_url)
#             if html is None:
#                 continue

#             parsed_url = urlparse(current_url)
#             path = parsed_url.path
#             if not path or path.endswith('/'):
#                 filepath = os.path.join(output_dir, path.lstrip('/'), 'index.html')
#             else:
#                 filepath = os.path.join(output_dir, path.lstrip('/'))

#             os.makedirs(os.path.dirname(filepath), exist_ok=True)
#             with open(filepath, 'w', encoding='utf-8') as f:
#                 f.write(html)

#             soup = BeautifulSoup(html, 'html.parser')
#             for tag in soup.find_all(['a', 'link', 'script', 'img']):
#                 if isinstance(tag, Tag):
#                     attr = 'href' if tag.name in ['a', 'link'] else 'src'
#                     if tag.has_attr(attr):
#                         link_url = str(tag[attr])
#                         absolute_url = urljoin(current_url, link_url)
#                         if urlparse(absolute_url).netloc == domain_name and absolute_url not in visited_urls:
#                             urls_to_visit.append(absolute_url)

#     print("\n✅ Download complete.")

# if __name__ == '__main__':
#     target_url = 'http://scoress456.housingrents.us'
#     asyncio.run(download_site(target_url))
