#!/bin/bash

# Define the list of commands
commands=(
  "python3 crawl.py --url https://usc.edu --browser chrome"
  "python3 crawl.py --url https://usc.edu --browser firefox"
  "python3 crawl.py --url https://usc.edu --browser edge"
  "python3 crawl.py --url https://www.firefox.com --browser chrome"
  "python3 crawl.py --url https://www.firefox.com --browser firefox"
  "python3 crawl.py --url https://www.firefox.com --browser edge"
  "python3 crawl.py --url https://www.nic.do --browser chrome"
  "python3 crawl.py --url https://www.nic.do --browser firefox"
  "python3 crawl.py --url https://www.nic.do --browser edge"
  "python3 crawl.py --url https://www.paypal.com --browser chrome"
  "python3 crawl.py --url https://www.paypal.com --browser firefox"
  "python3 crawl.py --url https://www.paypal.com --browser edge"
)

# Loop through the commands and run each with a 3-second delay
for cmd in "${commands[@]}"; do
  echo "Running: $cmd"
  # Execute the command and show both output and errors
  eval "$cmd" 2>&1
  sleep 3
done
#!/bin/bash

# Define the list of commands
commands=(
  "python3 crawl.py --url https://wikipedia.org --browser chrome"
  "python3 crawl.py --url https://wikipedia.org --browser firefox"
  "python3 crawl.py --url https://wikipedia.org --browser edge"
  "python3 crawl.py --url https://usc.edu --browser chrome"
  "python3 crawl.py --url https://usc.edu --browser firefox"
  "python3 crawl.py --url https://usc.edu --browser edge"
  "python3 crawl.py --url https://www.firefox.com --browser chrome"
  "python3 crawl.py --url https://www.firefox.com --browser firefox"
  "python3 crawl.py --url https://www.firefox.com --browser edge"
  "python3 crawl.py --url https://www.nic.do --browser chrome"
  "python3 crawl.py --url https://www.nic.do --browser firefox"
  "python3 crawl.py --url https://www.nic.do --browser edge"
  "python3 crawl.py --url https://www.paypal.com --browser chrome"
  "python3 crawl.py --url https://www.paypal.com --browser firefox"
  "python3 crawl.py --url https://www.paypal.com --browser edge"
)

# Loop through the commands and run each with a 3-second delay
for cmd in "${commands[@]}"; do
  echo "Running: $cmd"
  # Execute the command and show both output and errors
  eval "$cmd" 2>&1
  sleep 3
done
