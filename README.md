# Update Hymnals

## Components
Update Hymnals works together with these other components:

  - [Study Hymnal](https://github.com/GospelSounders/all-sda-hymnals)
  - [Hymnals Data](https://github.com/GospelSounders/hymnals-data)
  - [All Hymnals](https://docs.google.com/spreadsheets/d/16-cSCawG9fX__QXLWnPyC9-tBUDW2lW7lLhm5UfpEtI/edit?usp=sharing)

Update hymnals is the service that ensures changes made to the [All Hymnals Sheets](https://docs.google.com/spreadsheets/d/16-cSCawG9fX__QXLWnPyC9-tBUDW2lW7lLhm5UfpEtI/edit?usp=sharing) having the hymnals data is updated to the [Hymnals Data repo](https://github.com/GospelSounders/hymnals-data) where it is picked by the [Study Hymnal](https://github.com/GospelSounders/all-sda-hymnals).


## Table of Contents

- [Installation](#installation)
  - [Requirements](#requirements)
  - [Installing Prerequisites](#installing-prerequisites)
  - [Installing UpdateHymnals](#installing-updateHymnals)
- [Usage](#usage)
- [Features](#features)
- [Todo](#todo)

## Installation

### Requirements
- nodejs v>=6
- yarn /npm

### Installing Prerequisites

- Install [yarn](https://yarnpkg.com/lang/en/docs/install/)

### Installing UpdateHymnals

We will presume that you have git installed. If not then grab it!


```sh
cd /var/www/html/updatehymnals/
git clone https://github.com/GospelSounders/updatehymnals.git
cd updatehymnals/
yarn install
cd install
cp -r lib/ /
cd ../hymnals-data
git clone https://github.com/GospelSounders/hymnals-data.git .
```

Change also localhost to the url of your server in the google scripts. The default port(defined in .env.example) is 3002
```sh
cd /var/www/html/updatehymnals/resources

./changeurl.sh  http://localhost:3002 your-url:your_port
```

Then use the import `All Hymnals.xlsx` from resources to google sheets and create a script with the contents from `script.gs` 

## Usage

Enable the service after installation

```sh
systemctl daemon-reload
systemctl enable updatehymnals.service
systemctl start updatehymnals.service
```

- Goto `All Hymnals.xlsx` 
- Open the tab of the hymnal to update
- Click on Update hymnals menu and wait until a msgbox appears
- Copy link from message box and paste into bin/resources/csvuploads/{HYMNALNAME}.enc
- remove the part of the url that is equal to `https://www.gospelsounders.org/updatehymnals/hymnals/SDAH/`
- sync with server by running (from /path/to/updatehymnals/)
```sh
rsync -a bin/csvuploads/ root@gospelsounders.org:/var/www/html/updatehymnals/bin/csvuploads/
```
- Open your browser to `https://www.gospelsounders.org/updatehymnals/hymnalsv1/{hymnalname}`
- Go back to sheets and open AllHymnalsSheet and increment `fixed` for that hymnal and change `updated` to 1
- Go to github and merge changes to master


Then just peek in to see if things work fine
```sh
journalctl -f -u updatehymnals
```

## Features
- [x] Automatic updates

## Todo
- [ ] Create forms
- [ ] Update from sheets hourly