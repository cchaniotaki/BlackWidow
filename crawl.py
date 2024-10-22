from selenium import webdriver
from selenium.webdriver.remote.webdriver import WebDriver
import argparse
import re
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from Classes import *
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


parser = argparse.ArgumentParser(description='Crawler')
parser.add_argument("--debug", action='store_true',
                    help="Dont use path deconstruction and recon scan. Good for testing single URL")
parser.add_argument("--url", help="Custom URL to crawl")
parser.add_argument('--browser', type=str, required=True, help='The browser you want to use (firefox, chrome, or edge)')
args = parser.parse_args()


# VISUALIZATION
# Function to read the graph from a text file

# Function to read the graph from a text file
def read_graph_from_file(file_path):
    edges = []
    edge_labels = {}

    with open(file_path, 'r') as file:
        content = file.read()

        # Extract edges using regex
        edges_section = re.search(r'Graph\[\{(.*?)\},', content, re.DOTALL)
        if edges_section:
            edges_data = edges_section.group(1).strip().split(',')

            for edge in edges_data:
                # Clean up edge format and create tuples
                edge = edge.strip().replace('->', '->').replace('"', '').strip()
                edge_tuple = tuple(edge.split(' -> '))
                edges.append(edge_tuple)

        # Extract edge labels using regex
        labels_section = re.search(r'EdgeLabels -> \{(.*?)\},', content, re.DOTALL)
        if labels_section:
            labels_data = labels_section.group(1).strip().split('},')
            for label in labels_data:
                # Extract edge and label from the label string
                label = label.strip()
                if label:
                    edge_label = re.match(r'\(\s*"(.*?)"\s*->\s*"(.*?)"\s*\)\s*->\s*"(.*)"', label)
                    if edge_label:
                        edge = (edge_label.group(1), edge_label.group(2))
                        label_text = edge_label.group(3)
                        edge_labels[edge] = label_text

    return edges, edge_labels


# END VISUALIZATION


# Clean form_files/dynamic
root_dirname = os.path.dirname(__file__)
dynamic_path = os.path.join(root_dirname, 'form_files', 'dynamic')
for f in os.listdir(dynamic_path):
    os.remove(os.path.join(dynamic_path, f))

WebDriver.add_script = add_script


def set_up_chrome_driver():
    # launch Chrome
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-xss-auditor")

    # Set up the Chrome driver
    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Read scripts and add script which will be executed when the page starts loading
    ## JS libraries from JaK crawler, with minor improvements
    driver.add_script(open("js/lib.js", "r").read())
    driver.add_script(open("js/property_obs.js", "r").read())
    driver.add_script(open("js/md5.js", "r").read())
    driver.add_script(open("js/addeventlistener_wrapper.js", "r").read())
    driver.add_script(open("js/timing_wrapper.js", "r").read())
    driver.add_script(open("js/window_wrapper.js", "r").read())
    # Black Widow additions
    driver.add_script(open("js/forms.js", "r").read())
    driver.add_script(open("js/xss_xhr.js", "r").read())
    driver.add_script(open("js/remove_alerts.js", "r").read())

    return driver


def set_up_firefox_driver():
    # launch Firefox
    firefox_options = webdriver.FirefoxOptions()
    firefox_options.add_argument("--disable-web-security")
    firefox_options.add_argument("--disable-xss-auditor")


    # Set up the Frefox driver
    service = Service(GeckoDriverManager().install())
    driver = webdriver.Firefox(service=service, options=firefox_options)

    # Wait until a specific element is present to ensure your script has run
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    # Add the extension after starting the session
    driver.install_addon("/Users/christinechaniotaki/PycharmProjects/SQL/BlackWidow", temporary=True)  # Use temporary=True for a session-specific installation

    return driver


def set_up_edge_driver():
    # edge_options = EdgeOptions()
    # edge_options.set_capability("--disable-web-security")
    # edge_options.set_capability("--disable-xss-auditor")

    service = Service(EdgeChromiumDriverManager().install())
    driver = webdriver.Edge(service=service)

    return driver




if args.browser == 'firefox':
    driver = set_up_firefox_driver()
elif args.browser == 'chrome':
    driver = set_up_chrome_driver()
else:  # edge
    driver = set_up_edge_driver()

# driver.set_window_position(-1700,0)




if args.url:
    browser = args.browser
    url = args.url
    Crawler(driver, url, browser).start(args.debug)
    driver.quit()

else:
    print("Please use --url")
