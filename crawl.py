from selenium import webdriver
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.action_chains import ActionChains
import json
import pprint
import argparse
import networkx as nx
import matplotlib.pyplot as plt
import re


from Classes import *

parser = argparse.ArgumentParser(description='Crawler')
parser.add_argument("--debug", action='store_true',  help="Dont use path deconstruction and recon scan. Good for testing single URL")
parser.add_argument("--url", help="Custom URL to crawl")
parser.add_argument("--crawler", action='store_true', help="Only run the crawler")
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

# Path to chromedriver, update it accordingly
chrome_driver_path = "/opt/homebrew/bin/chromedriver"  # Replace with the correct path


chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument("--disable-web-security")
chrome_options.add_argument("--disable-xss-auditor")

print(args.crawler)

# launch Chrome
# Set up the Chrome driver
driver = webdriver.Chrome(executable_path=chrome_driver_path, options=chrome_options)



#driver.set_window_position(-1700,0)

# Read scripts and add script which will be executed when the page starts loading
## JS libraries from JaK crawler, with minor improvements
driver.add_script( open("js/lib.js", "r").read() )
driver.add_script( open("js/property_obs.js", "r").read() )
driver.add_script( open("js/md5.js", "r").read() )
driver.add_script( open("js/addeventlistener_wrapper.js", "r").read() )
driver.add_script( open("js/timing_wrapper.js", "r").read() )
driver.add_script( open("js/window_wrapper.js", "r").read() )
# Black Widow additions
driver.add_script( open("js/forms.js", "r").read() )
driver.add_script( open("js/xss_xhr.js", "r").read() )
driver.add_script( open("js/remove_alerts.js", "r").read() )

if args.url:
    url = args.url
    Crawler(driver, url).start(args.debug, args.crawler)
    driver.quit()
    # visualization of the graph
    # Read the graph
    # edges, edge_labels = read_graph_from_file("graph_mathematica.txt")
    #
    # # Create a directed graph
    # G = nx.DiGraph()
    #
    # # Add edges to the graph
    # G.add_edges_from(edges)
    #
    # # Draw the graph
    # pos = nx.spring_layout(G)  # positions for all nodes
    # nx.draw(G, pos, with_labels=True, arrows=True, node_size=2000, node_color='lightblue', font_size=10,
    #         font_weight='bold')
    #
    # # Draw edge labels
    # nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)
    #
    # # Show the plot
    # plt.title("Wikipedia Interaction Graph")
    # plt.show()


else:
    print("Please use --url")




