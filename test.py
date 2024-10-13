# from selenium import webdriver
# from selenium.webdriver.firefox.service import Service
# from webdriver_manager.firefox import GeckoDriverManager
#
# # Set up the Firefox WebDriver
# service = Service(GeckoDriverManager().install())
# driver = webdriver.Firefox(service=service)
#
# # Open a test page
# driver.get("https://www.wikipedia.org")
#
# # Print the title of the page
# print(driver.title)
#
# # Close the driver
# driver.quit()


from urllib.parse import urlparse

def same_page(url1, url2):
    """Checks if two URLs belong to the same page."""

    # Parse the URLs
    parsed1 = urlparse(url1)
    parsed2 = urlparse(url2)

    print(parsed1)
    print(parsed2)

    if len(parsed1.path) == 1 and parsed1.path == "/":
        path1 = ""
    else:
        path1 = parsed1.path

    if len(parsed2.path) == 1 and parsed2.path == "/":
        path2 = ""
    else:
        path2 = parsed2.path


    # Compare relevant components
    return (
        parsed1.scheme == parsed2.scheme and
        parsed1.netloc == parsed2.netloc and
        path1 == path2
    )

url1 = 'https://s.edu/'
url2 = 'https://usc.edu/#main-content'

print(same_page(url1, url2))




