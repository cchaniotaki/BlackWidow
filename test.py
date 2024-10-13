from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager

# Set up the Firefox WebDriver
service = Service(GeckoDriverManager().install())
driver = webdriver.Firefox(service=service)

# Open a test page
driver.get("https://www.wikipedia.org")

# Print the title of the page
print(driver.title)

# Close the driver
driver.quit()
