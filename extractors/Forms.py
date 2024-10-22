from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.common.exceptions import StaleElementReferenceException
import json
import traceback
import logging

import Classes
from Utils import is_same_page


def parse_form(el, driver):
    form = Classes.Form()
    try:
        if el.get_attribute("action"):
            form.action = el.get_attribute("action")
            if el.get_attribute("method"):
                form.method = el.get_attribute("method")
            else:
                form.method = "get"

    except StaleElementReferenceException as e:
        logging.error("Stale pasta in from action")
        logging.error(traceback.format_exc())
    except:
        logging.error("Failed to write element")
        logging.error(traceback.format_exc())

    # <input> tags
    try:
        inputs = el.find_elements(By.TAG_NAME,"input")
    except StaleElementReferenceException as e:
        print("Stale pasta in inputs")
        logging.error("Stale pasta in inputs")
        inputs = None
    except:
        logging.error("Unknown exception in inputs")
        inputs = None



    if not inputs:
        # TODO Exapnd JavaScript for all types of elements
        inputs = []
        logging.warning("No inputs founds during parse, falling back to JavaScript")
        resps = driver.execute_script("return get_forms()")
        js_forms = json.loads(resps)
        for js_form in js_forms:
            current_form = Classes.Form()
            current_form.method = js_form['method'];
            current_form.action = js_form['action'];
            logging.info("Found js form: " + str(current_form) )


            if( current_form.method == form.method and current_form.action == form.action ):
                for js_el in js_form['elements']:
                    web_el = driver.find_element(By.XPATH,js_el['xpath'])
                    inputs.append(web_el)
                break


    for iel in inputs:
        tmp = {'type': None, 'name': None, 'value': None, 'checked': None}
        try:
            if iel.get_attribute("type"):
                tmp['type'] = iel.get_attribute("type")
            if iel.get_attribute("name"):
                tmp['name'] = iel.get_attribute("name")
            if iel.get_attribute("value"):
                tmp['value'] = iel.get_attribute("value")
            if iel.get_attribute("checked"):
                tmp['checked'] = True

        except StaleElementReferenceException as e:
            print("Stale pasta in from action")
        except:
            print("Failed to write element")
            print(traceback.format_exc())
        form.add_input(tmp['type'], tmp['name'], tmp['value'], tmp['checked'])



    # <select> and <option> tags
    selects = el.find_elements(By.TAG_NAME,"select")
    for select in selects:
        tmp = {'name': None}
        if select.get_attribute("name"):
            tmp['name'] = select.get_attribute("name")
        form_select = form.add_select("select", tmp['name'])

        selenium_select = Select( select )
        options = selenium_select.options
        for option in options:
            form_select.add_option( option.get_attribute("value") )
            #if option == selenium_select.first_selected_option:
            #    form_select.selected = option.get_attribute("value")

    # <textarea> tags
    textareas = el.find_elements(By.TAG_NAME,"textarea")
    for ta in textareas:
        tmp = {'name': None, 'value': None}
        try:
            if ta.get_attribute("name"):
                tmp['name'] = ta.get_attribute("name")
            if ta.get_attribute("value"):
                tmp['value'] = ta.get_attribute("value")

        except StaleElementReferenceException as e:
            print("Stale pasta in from action")
        except:
            print("Failed to write element")
            print(traceback.format_exc())
        form.add_textarea(tmp['name'], tmp['value'])

    # <button> tags
    buttons = el.find_elements(By.TAG_NAME,"button")
    for button in buttons:
        form.add_button(button.get_attribute("type"),
                        button.get_attribute("name"),
                        button.get_attribute("value")
                       )

    # <iframe> with <body contenteditable>
    iframes = el.find_elements(By.TAG_NAME,"iframe")
    for iframe in iframes:
        iframe_id =  iframe.get_attribute("id")
        driver.switch_to.frame(iframe)
        iframe_body = driver.find_element(By.TAG_NAME,"body")

        if(iframe_body.get_attribute("contenteditable") == "true"):
            form.add_iframe_body(iframe_id)

        driver.switch_to.default_content();

    return form


# Search for <form>
def extract_forms(original_url, driver):
    elem = driver.find_elements(By.TAG_NAME, "form")

    forms = set()
    for el in elem:
        form = parse_form(el, driver)
        if form.action and form.action.find("http") >= 0 and is_same_page(original_url, form.action):
            logging.info("extract forms compare urls " + original_url + " " + form.action)
            print("extract forms compare urls: ", original_url, form.action)
            forms.add(parse_form(el, driver))
        elif form.action.find("http") < 0:
            forms.add(parse_form(el, driver))
    return forms


