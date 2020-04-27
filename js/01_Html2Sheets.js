class Html2Sheets {

  config(u, w, h, hh, fh, mt, mr, mb, ml)
  {
    this.units = u;

    this.pageWidth = w;
    this.pageHeight = h;
    this.headerHeight = hh;
    this.footerHeight = fh;

    this.marginTop = mt;
    this.marginRight = mr;
    this.marginBottom = mb;
    this.marginLeft = ml;
  }

  setWidth(w) { this.pageWidth = w; }
  setPageWidth(w) { this.pageWidth = w; }

  setHeight(h) { this.pageHeight = h; }
  setPageHeight(h) { this.pageHeight = h; }

  setHeaderHeight(h) { this.headerHeight = h; }
  setFooterHeight(h) { this.footerHeight = h; }

  setMarginTop(m) { this.marginTop = m; }
  setMarginRight(m) { this.marginRight = m; }
  setMarginBottom(m) { this.marginBottom = m; }
  setMarginLeft(m) { this.marginLeft = m; }
  setMargin(m) { 
    this.marginTop = m;
    this.marginRight = m;
    this.marginBottom = m;
    this.marginLeft = m;
  }

  setDebug(d) {
    this.debug = d;
    if(this.debug) { console.log("Html2Sheets Debug output to console enabled!"); }
  }

  /*
  setFrom(f) {
    if(document.getElementById(f) != undefined) {
      this.from = f;
      return true;
    } else {
      this.d("ERROR: could not set the 'from' container!");
      return false;
    }
  }
  setTo(t) {
    if(document.getElementById(t) != undefined) {
      this.to = t;
      return true;
    } else {
      this.d("ERROR: could not set the 'to' container!");
      return false;
    }
  }
  */

  wrapFromTo(from, to)
  {
    //if(!this.setFrom(from)) { return false; }
    //if(!this.setTo(to)) { return false; }
    if(document.getElementById(from) == undefined) {
      this.d("ERROR: could not find content container with id '"+from+"'");
      return false;
    }

    if(document.getElementById(to) == undefined) {
      this.d("ERROR: could not find target container with id '"+to+"'");
      return false;
    }

    if(!this.checkConfig()) {
      this.d("ERROR: could not finish wrapping because config is bad");
      return false;
    }

    this.appendOwnStyle();

    var content = this.grabContent(from);

    this.startWrapping(content, to);

    document.getElementById(from).remove();

  }


  // -------------------------------- MAIN ROUTINE METHODS --------------------------------

  grabContent(from)
  {
    var contentContainer = document.getElementById(from);
    var content = contentContainer.children;
    return content;
  }

  startWrapping(content, to)
  {
    var to = document.getElementById(to);
    this.d("starting to wrap "+content.length+" children into '"+to.id+"'");

    var childLeft = content.length;
    var childCnt = 0;
    var secCnt = 0;
    var secCntMax = 1000;

    // get initial height
    var initHeight = this.getInitPageHeight(to);
    var maxHeight = this.getMaxElementHeight(to);
    this.d("init height: "+initHeight+", max height: "+maxHeight);

    while(childLeft > 0 && secCnt < secCntMax)
    {
      secCnt++;

      var page = document.createElement("div");
      page.classList.add("page");
      to.append(page);
      var pageInner = document.createElement("div");
      pageInner.classList.add("page-inner");
      page.append(pageInner);

      var filled = false;

      while(!this.checkOverflow(pageInner) && !filled && secCnt < secCntMax)
      {
        if(content[childCnt] == undefined) {
          secCnt = 1000;
          break;
        }

        var currNode = content[childCnt].cloneNode(true);
        pageInner.append(currNode);

        if(this.checkOverflow(pageInner))
        {
          this.d(currNode.tagName+" with offsetHeight "+currNode.offsetHeight+" too big, reversing and creating new page");

          var lastToNewPage = false;
          var lastToOwnPage = false;

          // if last element of last page is header, bring it to the new page
          if( pageInner.children[pageInner.children.length - 2].tagName == "H1" ||
              pageInner.children[pageInner.children.length - 2].tagName == "H2" ||
              pageInner.children[pageInner.children.length - 2].tagName == "H3" ||
              pageInner.children[pageInner.children.length - 2].tagName == "H4" ||
              pageInner.children[pageInner.children.length - 2].tagName == "H5" ||
              pageInner.children[pageInner.children.length - 2].tagName == "H6"
          ) { lastToNewPage = true; }

          // if new element is bigger than max height, give it an own page
          if(pageInner.children[pageInner.children.length - 1].offsetHeight > maxHeight) {
            lastToOwnPage = true;
          }

          
          // if last element of last page is header, bring it to the new page
          if( lastToNewPage && !lastToOwnPage)
          {
            this.d("last element of last page was "+pageInner.children[pageInner.children.length - 2].tagName+", bringing it to new page");
            pageInner.children[pageInner.children.length-1].remove();
            pageInner.children[pageInner.children.length-1].remove();
            childCnt--;
          }

          // if new element is bigger than max height, give it an own page
          if(lastToOwnPage)
          {
            this.d("This element is too big, probably an image, creating new page for it");
            var page = document.createElement("div");
            page.classList.add("page");
            to.append(page);
            var pageInner = document.createElement("div");
            pageInner.classList.add("page-inner");
            page.append(pageInner);
            pageInner.append(currNode);
          } else {
            childCnt--;
            currNode.remove();
          }
           
          
          filled = true;
        } else {
          this.d("Set "+currNode.tagName+" of offsetHeight "+currNode.offsetHeight+" into page");
        }



        childCnt++;
        secCnt++;
      }

      //this.d("next element offsetHeight: "+content[childCnt].offsetHeight);
    }

  }



  // -------------------------------- FUNCTIONAL HELPER AND ROUNDABOUT METHODS --------------------------------

  getInitPageHeight(to)
  {
    var initPage = document.createElement("div");
    initPage.classList.add("page");
    to.appendChild(initPage);
    var height = initPage.offsetHeight;
    initPage.remove();
    return height;
  }

  getMaxElementHeight(to) {
    var initPage = document.createElement("div");
    initPage.classList.add("page");
    to.appendChild(initPage);

    var initPageInner = document.createElement("div");
    initPageInner.innerHTML = "&nbsp;";
    initPageInner.classList.add("page-inner");
    initPageInner.style.height = "100%";
    initPage.appendChild(initPageInner);

    var maxHeight = initPageInner.offsetHeight;
    initPage.remove();
    return maxHeight;
  }

  appendOwnStyle() {
    var styleString = `
    <style>
      .page {
        width:`+this.pageWidth+this.units+`;
        height:`+this.pageHeight+this.units+`;
        max-width:`+this.pageWidth+this.units+`;
        max-height:`+this.pageHeight+this.units+`;
      }
      .page-inner {
        margin-top:`+this.marginTop+this.units+`;
        margin-right:`+this.marginRight+this.units+`;
        margin-bottom:`+this.marginBottom+this.units+`;
        margin-left:`+this.marginLeft+this.units+`;
        max-width:`+(this.pageWidth - this.marginLeft - this.marginRight)+this.units+`;
        max-height:`+(this.pageHeight - this.marginTop - this.marginBottom)+this.units+`;
      }
      .page-header {
        height:`+this.headerHeight+`;
        max-height:`+this.headerHeight+`;
      }
      .page-footer {
        height:`+this.footerHeight+`;
        max-height:`+this.headerHeight+`;
      }
    </style>
    `;
    document.getElementsByTagName("head")[0].innerHTML = document.getElementsByTagName("head")[0].innerHTML + styleString;
  }

  checkConfig() {
    return true;
  }

  checkOverflow(el)
  {
   var curOverflow = el.style.overflow;

   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   var isOverflowing = el.clientWidth < el.scrollWidth 
      || el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
  }


  // -------------------------------- "OUTSIDE" HELPERS --------------------------------

  d(m) {
    if(this.debug) { console.log(m); }
  }


}