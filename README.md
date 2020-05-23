# THIS IS IN EARLY ALPHA STATE, WORK IN PROGRESS

# js-html2sheets


## Description

This little javascript library transforms and wraps html content in a way, that the output is suitable for different paper formats.
Or in simpler words: This is an html to (paper)sheets library.
So as a result you have those typical document / paper formats. You can print the result properly or create pdf documents out of it.


## Why

I want to write my documents, letters, documentations, papers, etc. in HTML and not with programs like microsoft office or libre office, so I tried to do that.
If you just need some page-breaks, "not so precise" borders and no headers and/or footers per page, the standard HTML/CSS possibilities are ok to create something out of HTML.
But if you want or need some more features and functionality, you will run into some problems, play around for hours or days with  HTML and CSS and get no proper result out of it.
So I came up with a little html-css-javascript-library-system-thing to achieve that.


## How does it work (short answer)?
See chapter **getting started** for the details

1. Create an html file with your content in the proper way.
1. Include the javascript file under js/html2sheets.js
1. Create a variable with the config.
1. Instantiate and initialize the class Html2Sheets with the config.
1. When you open the html file, the class does its magic.


## Getting started

### 0. Get all the files and stuff
Download the files, put them somewhere, edit the root html file or create a new one or whatever, you know how this works (at least I hope so).

### 1. Basic structure of your HTML document
Here is an example basic structure of an html document.
It's basically just about including the html2sheets javascript and css file and of course your own css file and maybe javascript too.
```html
<html>

  <head>
    ...
    <link rel="stylehseet" type="text/css" href="css/html2sheets.css">
    <link rel="stylesheet" type="text/css" href="css/mystyles.css">
  </head>
  
  <body>
    ...
    
    <script src="js/html2sheets.js"></script>
    <script src="js/myjavascript.js"></script>
    
  </body>
  
</html>
```


### 2. Initialize/Instantiate the class
Details about the config are in a chapter below
```html
    ...
    <script src="js/html2sheets.js"></script>
    <script src="js/myjavascript.js"></script>
    <script>
    var h2s = new Html2Sheets();
    var config = {
      "debug" : true,
      "units" : "mm",
      ...
    }
    h2s.config(config);
    h2s.wrapFromTo("my-input-div-id", "my-output-div-id");
    </script>
  </body>

```


### 3. Create your content and output div
```html
  <body>
    <div id="my-input-div-id">
      <h1>My Document</h1>
      <h2>Abstraact</h2>
      <p>Lorem Ipsum...</p>
      <p>As you can see in the picture below...</p>
      <div class="figure">...</div>
      <h2>Another Topic</h2>
      <p>Text about another topic</p>
      ...
    </div>
    <div id="my-output-div-id">
    </div>
  </body>
```

### 4. Done
Just load the page in the browser and see the magic happen

## Config
You can control all the features and functionality with the config variable you create to initialize the html2sheets object.
Here is the description of all the parameters.

| Parameter | Use |
| ------ | ------ |
| <code>"debug"</code> | *( true \| false)* Debug javascript console output |
| <code>"units"</code> | *("mm" \| "inch")* Units to use for further parameters like width | 
| <code>"pageWidth"</code> | *(int)* Width of the page in **mm** or **inch**, depending on the parameter "units" | 
| <code>"pageHeight"</code> | *(int)* Height of the page in **mm** or **inch**, depending on the parameter "units" | 
| <code>"headersHeight"</code> | *(int)* Height of the headers |
| <code>"footerHeight"</code> | *(int)* Height of the footers | 
| <code>"marginTop"</code> | *(int)* Margin at the top of the page, before the content starts (does not affect header or footer) |
| <code>"marginRight"</code> | *(int)* Margin at the right of the page, before the content starts (does not affect header or footer) |
| <code>"marginBottom"</code> | *(int)* Margin at the bottom of the page, before the content starts (does not affect header or footer) |
| <code>"marginLeft"</code> | *(int)* Margin at the left of the page, before the content starts (does not affect header or footer) |
| <code>"pageCountStart"</code> | *(int)* the page number of where the page counting should begin | 
| <code>"headersStartPage"</code> | *(int)* the page where the headers start | 
| <code>"footersStartPage"</code> | *(int)* the page where the footers start | 
| <code>"orphans"</code> | *todo* |
| <code>"widows"</code> | *todo* |


## Features (and benefits over normal CSS)

* Margins actually match your values
* Working header and footer per page
* Page-Breaks

## Backdraws

* needs JS

# License

This Software/Files/Project is published under the <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU General Public License v3.0</a>.

