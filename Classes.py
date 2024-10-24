from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import (StaleElementReferenceException,
                                        TimeoutException,
                                        UnexpectedAlertPresentException,
                                        NoSuchFrameException,
                                        NoAlertPresentException,
                                        WebDriverException,
                                        InvalidElementStateException
                                        )

from urllib.parse import urlparse, urljoin
import json
import pprint
import datetime
import tldextract
import math
import os
import traceback
import random
import re
import time
import itertools
import string

from Functions import *
from extractors.Events import extract_events
from extractors.Forms import extract_forms, parse_form
from extractors.Urls import extract_urls
from extractors.Iframes import extract_iframes
from extractors.Ui_forms import extract_ui_forms

import logging

log_file = os.path.join(os.getcwd(), 'logs', 'crawl-' + str(time.time()) + '.log')
logging.basicConfig(filename=log_file,
                    format='%(asctime)s\t%(name)s\t%(levelname)s\t[%(filename)s:%(lineno)d]\t%(message)s',
                    datefmt='%Y-%m-%d:%H:%M:%S', level=logging.DEBUG)
# Turn off all other loggers that we don't care about.
for v in logging.Logger.manager.loggerDict.values():
    v.disabled = True


# This should be the main class for nodes in the graph
# Should contain GET/POST, Form data, cookies,
# events too?
class Request:
    def __init__(self, url, method):
        self.url = url
        # GET / POST
        self.method = method

        # Form data
        # self.forms = []

    def __repr__(self):
        if not self:
            return "NO SELF IN REPR"

        ret = ""
        if not self.method:
            ret = ret + "[NO METHOD?] "
        else:
            ret = ret + "[" + self.method + "] "

        if not self.url:
            ret = ret + "[NO URL?]"
        else:
            ret = ret + self.url

        return ret

    def __eq__(self, other):
        """Overrides the default implementation"""
        if isinstance(other, Request):
            return (self.url == other.url and
                    self.method == other.method)
        return False

    def __hash__(self):
        return hash(self.url + self.method)


class Graph:
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.data = {}  # Meta data that can be used for anything

    # Separate node class for storing meta data.
    class Node:
        def __init__(self, value):
            self.value = value
            # Meta data for algorithms
            self.visited = False

        def __repr__(self):
            return str(self.value)

        def __eq__(self, other):
            return self.value == other.value

        def __hash__(self):
            return hash(self.value)

    class Edge:
        # Value can be anything
        # For the crawler (type, data) is used,
        # where type = {"get", "form", "event"}
        # and   data = {None, data about form, data about event}
        def __init__(self, n1, n2, value, parent=None):
            self.n1 = n1
            self.n2 = n2
            self.value = value
            self.visited = False
            self.parent = parent

        def __eq__(self, other):
            return self.n1 == other.n1 and self.n2 == other.n2 and self.value == other.value

        def __hash__(self):
            return hash(hash(self.n1) + hash(self.n2) + hash(self.value))

        def __repr__(self):
            return str(self.n1) + " -(" + str(self.value) + "[" + str(self.visited) + "])-> " + str(self.n2)

    def add(self, value):
        node = self.Node(value)
        if not node in self.nodes:
            self.nodes.append(node)
            return True
        logging.info("failed to add node %s, already added" % str(value))
        return False

    def create_edge(self, v1, v2, value, parent=None):
        n1 = self.Node(v1)
        n2 = self.Node(v2)
        edge = self.Edge(n1, n2, value, parent)
        return edge

    def connect(self, v1, v2, value, parent=None):
        n1 = self.Node(v1)
        n2 = self.Node(v2)
        edge = self.Edge(n1, n2, value, parent)

        p1 = n1 in self.nodes
        p2 = n2 in self.nodes
        p3 = not (edge in self.edges)
        if (p1 and p2 and p3):
            self.edges.append(edge)
            return True
        logging.warning("Failed to connect edge, %s (%s %s %s)" % (str(value), p1, p2, p3))
        return False

    def visit_node(self, value):
        node = self.Node(value)
        if node in self.nodes:
            target = self.nodes[self.nodes.index(node)]
            target.visited = True
            return True
        return False

    def visit_edge(self, edge):
        if (edge in self.edges):
            target = self.edges[self.edges.index(edge)]
            target.visited = True
            return True
        return False

    def unvisit_edge(self, edge):
        if (edge in self.edges):
            target = self.edges[self.edges.index(edge)]
            target.visited = False
            return True
        return False

    def get_parents(self, value):
        node = self.Node(value)
        return [edge.n1.value for edge in self.edges if node == edge.n2]

    def __repr__(self):
        res = "---GRAPH---\n"
        for n in self.nodes:
            res += str(n) + " "
        res += "\n"
        for edge in self.edges:
            res += str(edge.n1) + " -(" + str(edge.value) + "[" + str(edge.visited) + "])-> " + str(edge.n2) + "\n"
        res += "\n---/GRAPH---"
        return res

    # Generates strings that can be pasted into mathematica to draw a graph.
    def toMathematica(self):
        cons = [('"' + str(edge.n1) + '" -> "' + str(edge.n2) + '"') for edge in self.edges]
        data = "{" + ",".join(cons) + "}"

        edge_cons = [('("' + str(edge.n1) + '" -> "' + str(edge.n2) + '") -> "' + edge.value.method + "," + str(
            edge.value.method_data) + '"') for edge in self.edges]
        edge_data = "{" + ",".join(edge_cons) + "}"

        vertex_labels = 'VertexLabels -> All'
        edge_labels = 'EdgeLabels -> ' + edge_data
        arrow_size = 'EdgeShapeFunction -> GraphElementData["FilledArrow", "ArrowSize" -> 0.005]'
        vertex_size = 'VertexSize -> 0.1'
        image_size = 'ImageSize->Scaled[3]'

        settings = [vertex_labels, edge_labels, arrow_size, vertex_size, image_size]

        res = "Graph[" + data + ", " + ','.join(settings) + "  ]"

        return res


class Form:
    def __init__(self):
        self.action = None
        self.method = None
        self.inputs = {}

    # Can we attack this form?
    def attackable(self):
        for input_el in self.inputs:
            if not input_el.itype:
                return True
            if input_el.itype in ["text", "password", "textarea"]:
                return True
        return False

    class Element:
        def __init__(self, itype, name, value):
            self.itype = itype
            self.name = name
            self.value = value

        def __repr__(self):
            return str((self.itype, self.name, self.value))

        def __eq__(self, other):
            return (self.itype == other.itype) and (self.name == other.name)

        def __hash__(self):
            return hash(hash(self.itype) + hash(self.name))

    class SubmitElement:
        def __init__(self, itype, name, value, use):
            self.itype = itype
            self.name = name
            self.value = value
            # If many submit button are available, one must be picked.
            self.use = use

        def __repr__(self):
            return str((self.itype, self.name, self.value, self.use))

        def __eq__(self, other):
            return ((self.itype == other.itype) and
                    (self.name == other.name) and
                    (self.use == other.use))

        def __hash__(self):
            return hash(hash(self.itype) + hash(self.name) + hash(self.use))

    class RadioElement:
        def __init__(self, itype, name, value):
            self.itype = itype
            self.name = name
            self.value = value
            # Click is used when filling out the form
            self.click = False
            # User for fuzzing
            self.override_value = ""

        def __repr__(self):
            return str((self.itype, self.name, self.value, self.override_value))

        def __eq__(self, other):
            p1 = (self.itype == other.itype)
            p2 = (self.name == other.name)
            p3 = (self.value == other.value)
            return (p1 and p2 and p3)

        def __hash__(self):
            return hash(hash(self.itype) + hash(self.name) + hash(self.value))

    class SelectElement:
        def __init__(self, itype, name):
            self.itype = itype
            self.name = name
            self.options = []
            self.selected = None
            self.override_value = ""

        def add_option(self, value):
            self.options.append(value)

        def __repr__(self):
            return str((self.itype, self.name, self.options, self.selected, self.override_value))

        def __eq__(self, other):
            return (self.itype == other.itype) and (self.name == other.name)

        def __hash__(self):
            return hash(hash(self.itype) + hash(self.name))

    class CheckboxElement:
        def __init__(self, itype, name, value, checked):
            self.itype = itype
            self.name = name
            self.value = value
            self.checked = checked
            self.override_value = ""

        def __repr__(self):
            return str((self.itype, self.name, self.value, self.checked))

        def __eq__(self, other):
            return (self.itype == other.itype) and (self.name == other.name) and (self.checked == other.checked)

        def __hash__(self):
            return hash(hash(self.itype) + hash(self.name) + hash(self.checked))

    # <select>
    def add_select(self, itype, name):
        new_el = self.SelectElement(itype, name)
        self.inputs[new_el] = new_el
        return self.inputs[new_el]

    # <input>
    def add_input(self, itype, name, value, checked):
        if itype == "radio":
            new_el = self.RadioElement(itype, name, value)
            key = self.RadioElement(itype, name, value)
        elif itype == "checkbox":
            new_el = self.CheckboxElement(itype, name, value, checked)
            key = self.CheckboxElement(itype, name, value, None)
        elif itype == "submit":
            new_el = self.SubmitElement(itype, name, value, True)
            key = self.SubmitElement(itype, name, value, None)
        else:
            new_el = self.Element(itype, name, value)
            key = self.Element(itype, name, value)

        self.inputs[key] = new_el
        return self.inputs[key]

    # <button>
    def add_button(self, itype, name, value):
        if itype == "submit":
            new_el = self.SubmitElement(itype, name, value, True)
            key = self.SubmitElement(itype, name, value, None)
        else:
            logging.error("Unknown button " + str((itype, name, value)))
            new_el = self.Element(itype, name, value)
            key = self.Element(itype, name, value)

        self.inputs[key] = new_el
        return self.inputs[key]

    # <textarea>
    def add_textarea(self, name, value):
        # Textarea functions close enough to a normal text element
        new_el = self.Element("textarea", name, value)
        self.inputs[new_el] = new_el
        return self.inputs[new_el]

    # <iframe>
    def add_iframe_body(self, id):
        new_el = self.Element("iframe", id, "")
        self.inputs[new_el] = new_el
        return self.inputs[new_el]

    def print(self):
        print("[form", self.action, self.method)
        for i in self.inputs:
            print("--", i)
        print("]")

    # For entire Form
    def __repr__(self):
        s = "Form(" + str(len(self.inputs)) + ", " + str(self.action) + ", " + str(self.method) + ")"
        return s

    def __eq__(self, other):
        return (self.action == other.action
                and self.method == other.method
                and self.inputs == other.inputs)

    def __hash__(self):
        return hash(hash(self.action) + hash(self.method) + hash(frozenset(self.inputs)))


# JavaScript events, clicks, onmouse etc.
class Event:
    def __init__(self, fid, event, i, tag, addr, c):
        self.function_id = fid
        self.event = event
        self.id = i
        self.tag = tag
        self.addr = addr
        self.event_class = c

    def __repr__(self):
        s = "Event(" + str(self.event) + ", " + self.addr + ")"
        return s

    def __eq__(self, other):
        return (self.function_id == other.function_id and
                self.id == other.id and
                self.tag == other.tag and
                self.addr == other.addr)

    def __hash__(self):
        if self.tag == {}:
            logging.warning("Strange tag... %s " % str(self.tag))
            self.tag = ""

        return hash(hash(self.function_id) +
                    hash(self.id) +
                    hash(self.tag) +
                    hash(self.addr))


class Iframe:
    def __init__(self, i, src):
        self.id = i
        self.src = src

    def __repr__(self):
        id_str = ""
        src_str = ""
        if self.id:
            id_str = "id=" + str(self.id)
        if self.src:
            src_str = "src=" + str(self.src)

        s = "Iframe(" + id_str + "," + src_str + ")"
        return s

    def __eq__(self, other):
        return (self.id == other.id and
                self.src == other.src
                )

    def __hash__(self):
        return hash(hash(self.id) +
                    hash(self.src)
                    )


class Ui_form:
    def __init__(self, sources, submit):
        self.sources = sources
        self.submit = submit

    def __repr__(self):
        return "Ui_form(" + str(self.sources) + ", " + str(self.submit) + ")"

    def __eq__(self, other):
        self_l = set([source['xpath'] for source in self.sources])
        other_l = set([source['xpath'] for source in other.sources])

        return self_l == other_l

    def __hash__(self):
        return hash(frozenset([source['xpath'] for source in self.sources]))


class Crawler:
    def __init__(self, driver, url, browser):
        self.driver = driver
        # Start url
        self.url = url
        self.browser = browser
        self.url_domain = url.split('//')[1]
        self.graph = Graph()

        self.session_id = str(time.time()) + "-" + str(random.randint(1, 10000000))

        # Used to track injections. Each injection will have unique key.
        self.attack_lookup_table = {}

        # input / output graph
        self.io_graph = {}

        # Optimization to do multiple events in a row without
        # page reloads.
        self.events_in_row = 0
        self.max_events_in_row = 15

        # Start with gets
        self.early_gets = 0
        self.max_early_gets = 100

        # Dont attack same form too many times
        # hash -> number of attacks
        self.attacked_forms = {}

        # Dont submit same form too many times
        self.done_form = {}
        self.max_done_form = 5

        logging.info("Init crawl on " + url)

    def start(self, debug_mode=False, crawler_mode=False):

        if (crawler_mode == False):
            print("run both crawler module and attack module")
        else:
            print("only run the crawler module")

        self.root_req = Request("ROOTREQ", "get")
        req = Request(self.url, "get")
        self.graph.add(self.root_req)
        self.graph.add(req)
        self.graph.connect(self.root_req, req, CrawlEdge("get", None, None))
        self.debug_mode = debug_mode

        # Path deconstruction
        # TODO arg for this
        if not debug_mode:
            purl = urlparse(self.url)
            if purl.path:
                path_builder = ""
                for d in purl.path.split("/")[:-1]:
                    if d:
                        path_builder += d + "/"
                        tmp_purl = purl._replace(path=path_builder)
                        req = Request(tmp_purl.geturl(), "get")
                        self.graph.add(req)
                        self.graph.connect(self.root_req, req, CrawlEdge("get", None, None))

        self.graph.data['urls'] = {}
        self.graph.data['form_urls'] = {}
        open(f"output/{self.url_domain}-{self.browser}-run.flag", "w+").write("1")
        open(f"output/{self.url_domain}-{self.browser}-queue.txt", "w+").write("")
        open(f"output/{self.url_domain}-{self.browser}-command.txt", "w+").write("")

        random.seed(6)  # chosen by fair dice roll

        still_work = True
        i = -1
        while still_work:
            i += 1
            print("-" * 50)
            new_edges = len([edge for edge in self.graph.edges if edge.visited == False])
            print("Edges left: %s" % str(new_edges))
            try:
                # f = open("graph.txt", "w")
                # f.write( self.graph.toMathematica() )

                if "0" in open(f"output/{self.url_domain}-{self.browser}-run.flag", "r").read():
                    logging.info("Run set to 0, stop crawling")
                    break
                if "2" in open(f"output/{self.url_domain}-{self.browser}-run.flag", "r").read():
                    logging.info("Run set to 2, pause crawling")
                    input("Crawler paused, press enter to continue")
                    open(f"output/{self.url_domain}-{self.browser}-run.flag", "w+").write("3")

                n_gets = 0
                n_forms = 0
                n_events = 0
                for edge in self.graph.edges:
                    if edge.visited == False:
                        if edge.value.method == "get":
                            n_gets += 1
                        elif edge.value.method == "form":
                            n_forms += 1
                        elif edge.value.method == "event":
                            n_events += 1
                print()
                print("----------------------")
                print("GETS    | FROMS  | EVENTS ")
                print(str(n_gets).ljust(7), "|", str(n_forms).ljust(6), "|", n_events)
                print("----------------------")

                try:
                    still_work = self.rec_crawl()
                except Exception as e:
                    still_work = n_gets + n_forms + n_events
                    print(e)
                    print(traceback.format_exc())
                    logging.error(e)

                    logging.error("Top level error while crawling")
                # input("Enter to continue")

            except KeyboardInterrupt:
                print("CTRL-C, abort mission")
                break

        print("Done crawling")

    def extract_vectors(self):
        print("Extracting urls")
        vectors = []
        added = set()

        exploitable_events = ["input", "oninput", "onchange", "compositionstart"]

        # GET
        for node in self.graph.nodes:
            if node.value.url != "ROOTREQ":
                purl = urlparse(node.value.url)
                if purl.scheme[:4] == "http" and not node.value.url in added:
                    vectors.append(("get", node.value.url))
                    added.add(node.value.url)

        # FORMS and EVENTS
        for edge in self.graph.edges:
            method = edge.value.method
            method_data = edge.value.method_data
            if method == "form":
                vectors.append(("form", edge))
            if method == "event":
                event = method_data

                # check both for event and onevent, e.g input and oninput
                print("ATTACK EVENT", event)
                if ((event.event in exploitable_events) or
                        ("on" + event.event in exploitable_events)):
                    if not event in added:
                        vectors.append(("event", edge))
                        added.add(event)

        return vectors

    def xss_find_state(self, driver, edge):
        graph = self.graph
        path = rec_find_path(graph, edge)

        for edge_in_path in path:
            method = edge_in_path.value.method
            method_data = edge_in_path.value.method_data
            logging.info("find_state method %s" % method)
            if method == "form":
                form = method_data
                try:
                    form_fill(driver, form)
                except:
                    logging.error("NO FORM FILL IN xss_find_state")

    def fix_form(self, form, payload_template, safe_attack):
        alert_text = "%RAND"

        # Optimization. If aggressive fuzzing doesn't add any new
        # types of elements then skip it
        only_aggressive = ["hidden", "radio", "checkbox", "select", "file"]
        need_aggressive = False
        for parameter in form.inputs:
            if parameter.itype in only_aggressive:
                need_aggressive = True
                break

        for parameter in form.inputs:
            (lookup_id, payload) = self.arm_payload(payload_template)
            if safe_attack:
                # SAFE.
                logging.debug("Starting SAFE attack")
                # List all injectable input types text, textarea, etc.
                if parameter.itype in ["text", "textarea", "password", "email"]:
                    # Arm the payload
                    form.inputs[parameter].value = payload
                    self.use_payload(lookup_id, (form, parameter, payload))
                else:
                    logging.info("SAFE: Ignore parameter " + str(parameter))
            elif need_aggressive:
                # AGGRESSIVE
                logging.debug("Starting AGGRESSIVE attack")
                # List all injectable input types text, textarea, etc.
                if parameter.itype in ["text", "textarea", "password", "email", "hidden"]:
                    # Arm the payload
                    form.inputs[parameter].value = payload
                    self.use_payload(lookup_id, (form, parameter, payload))
                elif parameter.itype in ["radio", "checkbox", "select"]:
                    form.inputs[parameter].override_value = payload
                    self.use_payload(lookup_id, (form, parameter, payload))
                elif parameter.itype == "file":
                    file_payload_template = "<img src=x onerror=xss(%RAND)>"
                    (lookup_id, payload) = self.arm_payload(file_payload_template)
                    form.inputs[parameter].value = payload
                    self.use_payload(lookup_id, (form, parameter, payload))
                else:
                    logging.info("AGGRESSIVE: Ignore parameter " + str(parameter))

        return form

    def get_payloads(self):
        payloads = []
        # %RAND will be replaced, useful for tracking
        alert_text = "%RAND"
        xss_payloads = ["<script>xss(" + alert_text + ")</script>",
                        "\"'><script>xss(" + alert_text + ")</script>",
                        '<img src="x" onerror="xss(' + alert_text + ')">',
                        '<a href="" jaekpot-attribute="' + alert_text + '">jaekpot</a>',
                        'x" jaekpot-attribute="' + alert_text + '" fix=" ',
                        'x" onerror="xss(' + alert_text + ')"',
                        "</title></option><script>xss(" + alert_text + ")</script>",
                        ]

        # xss_payloads = ['<a href="" jaekpot-attribute="'+alert_text+'">jaekpot</a>']
        return xss_payloads

    def arm_payload(self, payload_template):
        # IDs are strings to allow all strings as IDs in the attack table
        lookup_id = str(random.randint(1, 100000000))
        payload = payload_template.replace("%RAND", lookup_id)

        return (lookup_id, payload)

    # Adds it to the attack table
    def use_payload(self, lookup_id, vector_with_payload):
        self.attack_lookup_table[str(lookup_id)] = {"injected": vector_with_payload,
                                                    "reflected": set()}


    def reflected_payload(self, lookup_id, location):
        if str(lookup_id) in self.attack_lookup_table:
            self.attack_lookup_table[str(lookup_id)]["reflected"].add((self.driver.current_url, location))
        else:
            logging.warning("Could not find lookup_id %s, perhaps from an older attack session?" % lookup_id)

    # Surprisingly tricky to get the string/int types right for numeric ids...
    def get_table_entry(self, lookup_id):
        if lookup_id in self.attack_lookup_table:
            return self.attack_lookup_table[lookup_id]
        if str(lookup_id) in self.attack_lookup_table:
            return self.attack_lookup_table[str(lookup_id)]

        logging.warning("Could not find lookup_id %s " % lookup_id)
        return None

    def execute_path(self, driver, path):
        graph = self.graph

        for edge_in_path in path:
            method = edge_in_path.value.method
            method_data = edge_in_path.value.method_data
            logging.info("find_state method %s" % method)
            if method == "get":
                if allow_edge(graph, edge_in_path):
                    driver.get(edge_in_path.n2.value.url)
                else:
                    logging.warning("Not allowed to get: " + str(edge_in_path.n2.value.url))
                    return False
            elif method == "form":
                form = method_data
                try:
                    fill_result = form_fill(driver, form)
                    if not fill_result:
                        logging.warning("Failed to fill form:" + str(form))
                        return False
                except Exception as e:
                    print(e)
                    print(traceback.format_exc())
                    logging.error(e)
                    return False
            elif method == "event":
                event = method_data
                execute_event(self.url, driver, event)
                remove_alerts(driver)
            elif method == "iframe":
                logging.info("iframe, do find_state")
                if not find_state(self.url, driver, graph, edge_in_path):
                    logging.warning("Could not enter iframe" + str(edge_in_path))
                    return False

            elif method == "javascript":
                # The javascript code is stored in the to-node
                # "[11:]" gives everything after "javascript:"
                js_code = edge_in_path.n2.value.url[11:]
                try:
                    driver.execute_script(js_code)
                except Exception as e:
                    print(e)
                    print(traceback.format_exc())
                    logging.error(e)
                    return False
        return True

    def get_tracker(self):
        letters = string.ascii_lowercase
        return ''.join(random.choice(letters) for i in range(8))

    def use_tracker(self, tracker, vector_with_payload):
        self.io_graph[tracker] = {"injected": vector_with_payload,
                                  "reflected": set()}

    def track_form(self, driver, vector_edge):
        successful_xss = set()

        graph = self.graph
        path = rec_find_path(graph, vector_edge)

        form_edges = []
        for edge in path:
            if edge.value.method == "form":
                form_edges.append(edge)

        for form_edge in form_edges:
            form = form_edge.value.method_data
            tracker = self.get_tracker()
            for parameter in form.inputs:
                # List all injectable input types text, textarea, etc.
                if parameter.itype == "text" or parameter.itype == "textarea":
                    # Arm the payload
                    form.inputs[parameter].value = tracker
                    self.use_tracker(tracker, (form_edge, parameter, tracker))

        self.execute_path(driver, path)

        return successful_xss



    # Handle priority
    def next_unvisited_edge(self, driver, graph):
        user_url = open(f"output/{self.url_domain}-{self.browser}-queue.txt", "r").read()
        if user_url:
            print("User supplied url: ", user_url)
            logging.info("Adding user from URLs " + user_url)

            req = Request(user_url, "get")
            current_cookies = driver.get_cookies()
            new_edge = graph.create_edge(self.root_req, req, CrawlEdge(req.method, None, current_cookies),
                                         graph.data['prev_edge'])
            graph.add(req)
            graph.connect(self.root_req, req, CrawlEdge(req.method, None, current_cookies), graph.data['prev_edge'])

            print(new_edge)

            open(f"output/{self.url_domain}-{self.browser}-queue.txt", "w+").write("")
            open(f"output/{self.url_domain}-{self.browser}-run.flag", "w+").write("3")

            # input("Classes 1213 " + self.url)
            successful = follow_edge(self.url, driver, graph, new_edge)
            if successful:
                return new_edge
            else:
                logging.error("Could not load URL from user " + str(new_edge))

        # Always handle the iframes
        list_to_use = [edge for edge in graph.edges if edge.value.method == "iframe" and edge.visited == False]
        if list_to_use:
            print("Following iframe edge")

        # Start the crawl by focusing more on GETs
        if not self.debug_mode:
            if self.early_gets < self.max_early_gets:
                print("Looking for EARLY gets")
                print(self.early_gets, "/", self.max_early_gets)
                list_to_use = [edge for edge in graph.edges if edge.value.method == "get" and edge.visited == False]
                list_to_use = linkrank(list_to_use, graph.data['urls'])
                # list_to_use = new_files(list_to_use, graph.data['urls'])
                # list_to_use = reversed( list_to_use )
                if list_to_use:
                    self.early_gets += 1
                else:
                    print("No get, trying something else")
            if self.early_gets == self.max_early_gets:
                print("RESET")
                for edge in graph.edges:
                    graph.unvisit_edge(edge)
                graph.data['urls'] = {}
                graph.data['form_urls'] = {}
                self.early_gets += 1

        if not list_to_use and 'prev_edge' in graph.data:
            prev_edge = graph.data['prev_edge']

            if prev_edge.value.method == "form":

                prev_form = prev_edge.value.method_data
                if not (prev_form in self.attacked_forms):
                    print("prev was form, ATTACK")
                    logging.info("prev was form, ATTACK, " + str(prev_form))
                    # TODO should we skip attacking some elements?
                    if not prev_form in self.attacked_forms:
                        self.attacked_forms[prev_form] = 0
                    self.attacked_forms[prev_form] += 1

                    print("prev was form, TRACK")
                    logging.info("prev was form, TRACK")
                    self.track_form(driver, prev_edge)
                else:
                    logging.warning("Form already done! " + str(prev_form) + str(prev_form.inputs))
            else:
                self.events_in_row = 0

        if not list_to_use:
            random_int = random.randint(0, 100)
            if not list_to_use:
                if random_int >= 0 and random_int < 50:
                    print("Looking for form")
                    list_to_use = [edge for edge in graph.edges if
                                   edge.value.method == "form" and edge.visited == False]
                elif random_int >= 50 and random_int < 80:
                    print("Looking for get")
                    list_to_use = [edge for edge in graph.edges if edge.value.method == "get" and edge.visited == False]
                    list_to_use = linkrank(list_to_use, graph.data['urls'])
                else:
                    print("Looking for event")
                    print("--Clicks")
                    list_to_use = [edge for edge in graph.edges if edge.value.method == "event" and (
                            "click" in edge.value.method_data.event) and edge.visited == False]
                    if not list_to_use:
                        print("--No clicks found, check all")
                        list_to_use = [edge for edge in graph.edges if
                                       edge.value.method == "event" and edge.visited == False]

        # Try fallback to GET
        if not list_to_use:
            logging.warning("Falling back to GET")
            list_to_use = [edge for edge in graph.edges if edge.value.method == "get" and edge.visited == False]
            list_to_use = linkrank(list_to_use, graph.data['urls'])

        # for edge in graph.edges:
        for edge in list_to_use:
            if edge.visited == False:
                if not check_edge(driver, graph, edge):
                    logging.warning("Check_edge failed for " + str(edge))
                    edge.visited = True
                else:
                    # input("Classes 1312 " + self.url)
                    successful = follow_edge(self.url, driver, graph, edge)
                    if successful:
                        return edge

        # Final fallback to any edge
        for edge in graph.edges:
            if edge.visited == False:
                if not check_edge(driver, graph, edge):
                    logging.warning("Check_edge failed for " + str(edge))
                    edge.visited = True
                else:
                    # input("Classes 1324 " + self.url)
                    successful = follow_edge(self.url, driver, graph, edge)
                    if successful:
                        return edge

        # Check if we are still in early explore mode
        if self.early_gets < self.max_early_gets:
            # Turn off early search
            self.early_gets = self.max_early_gets
            return self.next_unvisited_edge(driver, graph)

        return None

    def load_page(self, driver, graph):
        request = None
        edge = self.next_unvisited_edge(driver, graph)
        if not edge:
            return None

        # Update last visited edge
        graph.data['prev_edge'] = edge

        request = edge.n2.value

        logging.info("Current url: " + driver.current_url)
        logging.info("Crawl (edge): " + str(edge))
        print("Crawl (edge): " + str(edge))

        return (edge, request)

    # Actually not recursive (TODO change name)
    def rec_crawl(self):
        driver = self.driver
        graph = self.graph

        todo = self.load_page(driver, graph)
        if not todo:
            print("Done crawling")
            print(graph)
            pprint.pprint(self.io_graph)

            for tracker in self.io_graph:
                if self.io_graph[tracker]['reflected']:
                    print("EDGE FROM ", self.io_graph[tracker]['injected'], "to", self.io_graph[tracker]['reflected'])

            f = open(f"output/{self.url_domain}-{self.browser}-graph_mathematica.txt", "w")
            f.write(self.graph.toMathematica())

            return False

        (edge, request) = todo
        graph.visit_node(request)
        graph.visit_edge(edge)

        # (almost) Never GET twice (optimization)
        if edge.value.method == "get":
            for e in graph.edges:
                if (edge.n2 == e.n2) and (edge != e) and (e.value.method == "get"):
                    # print("Fake visit", e)
                    graph.visit_edge(e)

        # Wait if needed
        try:
            wait_json = driver.execute_script("return JSON.stringify(need_to_wait)")
            wait = json.loads(wait_json)
            if wait:
                time.sleep(1)
        except UnexpectedAlertPresentException:
            logging.warning("Alert detected")
            alert = driver.switch_to.alert
            alert.dismiss()

            # Check if double check is needed...
            try:
                wait_json = driver.execute_script("return JSON.stringify(need_to_wait)")
                wait = json.loads(wait_json)
                if wait:
                    time.sleep(1)
            except:
                logging.warning("Inner wait error for need_to_wait")
        except:
            logging.warning("No need_to_wait")

        # Timeouts
        try:
            resps = driver.execute_script("return JSON.stringify(timeouts)")
            todo = json.loads(resps)
            for t in todo:
                try:
                    if t['function_name']:
                        driver.execute_script(t['function_name'] + "()")
                except:
                    logging.warning("Could not execute javascript function in timeout " + str(t))
        except:
            logging.warning("No timeouts from stringify")

        early_state = self.early_gets < self.max_early_gets
        # input("Classes 1422 " + self.url)
        login_form = find_login_form(self.url, driver, graph, early_state)

        if login_form:
            logging.info("Found login form")
            print("We want to test edge: ", edge)
            new_form = set_form_values(set([login_form])).pop()
            try:
                print("Logging in")
                form_fill(driver, new_form)
            except:
                logging.warning("Failed to login to potiential login form")

        # Extract urls, forms, elements, iframe etc
        reqs = extract_urls(driver)
        forms = extract_forms(self.url, driver)
        forms = set_form_values(forms)
        ui_forms = extract_ui_forms(driver)
        events = extract_events(driver)
        iframes = extract_iframes(driver)

        # Check if we need to wait for asynch
        try:
            wait_json = driver.execute_script("return JSON.stringify(need_to_wait)")
        except UnexpectedAlertPresentException:
            logging.warning("Alert detected")
            alert = driver.switch_to.alert
            alert.dismiss()
        wait_json = driver.execute_script("return JSON.stringify(need_to_wait)")
        wait = json.loads(wait_json)
        if wait:
            time.sleep(1)

        # Add findings to the graph
        current_cookies = driver.get_cookies()

        logging.info("Adding requests from URLs")
        for req in reqs:
            logging.info("from URLs %s " % str(req))
            new_edge = graph.create_edge(request, req, CrawlEdge(req.method, None, current_cookies), edge)
            if allow_edge(graph, new_edge):
                graph.add(req)
                graph.connect(request, req, CrawlEdge(req.method, None, current_cookies), edge)
            else:
                logging.info("Not allowed to add edge: %s" % new_edge)

        logging.info("Adding requests from froms")
        for form in forms:
            req = Request(form.action, form.method)
            logging.info("from forms %s " % str(req))
            new_edge = graph.create_edge(request, req, CrawlEdge("form", form, current_cookies), edge)
            if allow_edge(graph, new_edge):
                graph.add(req)
                graph.connect(request, req, CrawlEdge("form", form, current_cookies), edge)
            else:
                logging.info("Not allowed to add edge: %s" % new_edge)

        logging.info("Adding requests from events")
        for event in events:
            req = Request(request.url, "event")
            logging.info("from events %s " % str(req))

            new_edge = graph.create_edge(request, req, CrawlEdge("event", event, current_cookies), edge)
            if allow_edge(graph, new_edge):
                graph.add(req)
                graph.connect(request, req, CrawlEdge("event", event, current_cookies), edge)
            else:
                logging.info("Not allowed to add edge: %s" % new_edge)

        logging.info("Adding requests from iframes")
        for iframe in iframes:
            req = Request(iframe.src, "iframe")
            logging.info("from iframes %s " % str(req))

            new_edge = graph.create_edge(request, req, CrawlEdge("iframe", iframe, current_cookies), edge)
            if allow_edge(graph, new_edge):
                graph.add(req)
                graph.connect(request, req, CrawlEdge("iframe", iframe, current_cookies), edge)
            else:
                logging.info("Not allowed to add edge: %s" % new_edge)

        logging.info("Adding requests from ui_forms")
        for ui_form in ui_forms:
            req = Request(driver.current_url, "ui_form")
            logging.info("from ui_forms %s " % str(req))

            new_edge = graph.create_edge(request, req, CrawlEdge("ui_form", ui_form, current_cookies), edge)
            if allow_edge(graph, new_edge):
                graph.add(req)
                graph.connect(request, req, CrawlEdge("ui_form", ui_form, current_cookies), edge)
            else:
                logging.info("Not allowed to add edge: %s" % new_edge)

        # Try to clean up alerts
        try:
            alert = driver.switch_to.alert
            alert.dismiss()
        except NoAlertPresentException:
            pass

        # Check for successful attacks
        time.sleep(0.1)

        if "3" in open(f"output/{self.url_domain}-{self.browser}-run.flag", "r").read():
            logging.info("Run set to 3, pause each step")
            input("Crawler in stepping mode, press enter to continue. EDIT run.flag to run")

        # Check command
        found_command = False
        if "get_graph" in open(f"output/{self.url_domain}-{self.browser}-command.txt", "r").read():
            f = open(f"output/{self.url_domain}-{self.browser}-graph.txt", "w+")
            f.write(str(self.graph))
            f.close()
            found_command = True
        # Clear commad
        if found_command:
            open(f"output/{self.url_domain}-{self.browser}-command.txt", "w+").write("")

        return True


# Edge with specific crawling info, cookies, type of request etc.
class CrawlEdge:
    def __init__(self, method, method_data, cookies):
        self.method = method
        self.method_data = method_data
        self.cookies = cookies

    def __repr__(self):
        return str(self.method) + " " + str(self.method_data)

    # Cookies are not considered for equality.
    def __eq__(self, other):
        return (self.method == other.method and self.method_data == other.method_data)

    def __hash__(self):
        return hash(hash(self.method) + hash(self.method_data))
