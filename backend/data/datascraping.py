from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

options = Options()
options.add_argument('--headless')  # run without GUI
driver = webdriver.Chrome(options=options)

url = 'https://dmp.sante.gov.ma/public/basesdedonnes/listes-medicaments?page=1'
driver.get(url)

time.sleep(3)  # wait for JS to render

soup = BeautifulSoup(driver.page_source, 'html.parser')
table = soup.find('table')

if table:
    rows = table.find_all('tr')[1:]
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= 5:
            name = cols[0].text.strip()
            cip = cols[1].text.strip()
            ph = cols[3].text.strip()
            ppv = cols[4].text.strip()
            print(f"{name} | {cip} | PH: {ph} | PPV: {ppv}")
else:
    print("No table found.")

driver.quit()
    