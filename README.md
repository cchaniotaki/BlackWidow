# Black Widow - Blackbox Data-driven Web Scanning



## Running Black Widow

loipon afou to katebasa, arxika as ftiaksoume ena venv. 

- `python3 -m venv myenv`
- `source myenv/bin/activate`

i have updated the selenium with the new version.. 

- `python3 crawl.py --url https://wikipedia.org --crawler --browser firefox/chrome/edge`


SOS for firefox

### Load the Extension in Firefox

Open Firefox and type about:debugging into the address bar.
Click on "This Firefox" (or "Load Temporary Add-on" depending on the version).
Click "Load Temporary Add-on" and select the manifest.json file from your extension folder.
Once you load the extension, the inject.js script will run on every page you open in Firefox, and you’ll see the injected logs or behavior in the browser’s developer console.

1. Add chromedriver to your path

Example for current directory on linux:

PATH=$PATH:.

2. Run the scanner

python3 crawl.py --url https://wikipedia.org


allages pou ekana gia firefox kai edge

tha xreiastei na allakso ta javascript. gia na paizoun gia firefox kai edge

arxika etreksa ta parakato site na exo output prin kano allages gia na ta sugkrino me to meta na do oti einai ola ok.
to output prin einai apothikeumeno sto output-before-changes
python3 crawl.py --url https://wikipedia.org --crawler --browser chrome 
python3 crawl.py --url https://usc.edu --crawler --browser chrome 
python3 crawl.py --url https://www.cnn.com --crawler --browser chrome 
python3 crawl.py --url https://www.target.com --crawler --browser chrome 
python3 crawl.py --url https://www.costco.com --crawler --browser chrome 





