class Html2Sheets {

  config(config)
  {
    this.debug = config.debug;
    this.units = config.units;

    this.pageWidth = config.pageWidth;
    this.pageHeight = config.pageHeight;
    this.headerHeight = config.headerHeight;
    this.footerHeight = config.footerHeight;

    this.marginTop = config.marginTop;
    this.marginRight = config.marginRight;
    this.marginBottom = config.marginBottom;
    this.marginLeft = config.marginLeft;

    this.pageCountStart = config.pageCountStart;
    this.headerStartPage = config.headerStartPage;
    this.footerStartPage = config.footerStartPage;

    this.orphans = config.orphans;
    this.widows = config.widows;
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

  wrapFromTo(from, to)
  {
    var content = document.getElementById(from);

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

    this.appendDebugTags(content);

    this.startWrapping(content, to);

    document.getElementById(from).remove();

  }


  // -------------------------------- MAIN ROUTINE METHODS --------------------------------

  startWrapping(contentDOM, to)
  {
    this.unfinishedBusiness = true;
    var reversedHeadlines = false;
    this.pageCnt = 0;
    var pagesDOM = document.getElementById(to);

    // create DOM pointers
    //var pagesDOM_ctr = -1;
    var contentDOM_ctr = -1;

    // security counter to prevent infinite loops
    var secCnt = 0;
    var secCntMax = contentDOM.children.length * 5;
    secCntMax = 500;

    // get initial height
    var initHeight = this.getInitPageHeight(pagesDOM);
    var maxHeight = this.getMaxElementHeight(pagesDOM);

    // we iterate through every content element and decide what to do with it
    // also we put header and footer if appropriate
    this.d("> Start to iterate through contentDOM now");
    while(contentDOM_ctr < (contentDOM.children.length) && secCnt < secCntMax)
    {
      if(contentDOM_ctr >= 0) {
        this.d("-------- handling DOM element with debug id "+contentDOM.children[contentDOM_ctr].getAttribute("data-debug-id")+" --------");
      } else {
        this.d("-------- handling DOM element with contentDOM_ctr "+contentDOM_ctr+" --------");
      }
      /*this.d(">> started contentDOM loop, contentDOM_ctr = "+contentDOM_ctr);
      if(contentDOM_ctr >= 0) {
        this.d(">> ---------------- DEBUG ID: "+contentDOM.children[contentDOM_ctr].getAttribute("data-debug-id"));
      }*/
      // initial variables / situations / states
      var overflown = false;
      var headersBefore = 0;
      var pageBreakBefore = false;
      var pageBreakAfter = false;
      var currElementFitsOwnPage = false;
      var figureTooBig = false;
      var orphanSituation = false;
      var widowSituation = false;
      
      secCnt++;

      // -------- We check for all kind of situations and set the vars

      // we create an initial page and put it into the pagesDOM
      if(contentDOM_ctr == -1) {
        this.d(">> contentDOM_ctr == -1, creating initial page");
        var pageInner = this.createNewPage(pagesDOM);
        contentDOM_ctr = 0;
      }

      // we get the current element from the content 
      var currNode = contentDOM.children[contentDOM_ctr].cloneNode(true);
      this.d(">> "+currNode.tagName);

      // we check if the last element on the last page was a header and before that and so on
      if(contentDOM.children[contentDOM_ctr - 1] != undefined) {
        if(this.isHeadline(contentDOM.children[contentDOM_ctr - 1])) {
          this.d(">> headersBefore++");
          headersBefore++;
        }
      }


      // we do other stuff
      // TODO

      // We put the element into the page
      pageInner.append(currNode);

      // check for manual page-break-before
      if(currNode.classList.contains("page-break-before")) {
        this.d(">> found page-break-before");
        pageBreakBefore = true;
      }

      // check for manual page-break-after
      if(currNode.classList.contains("page-break-after")) {
        this.d(">> found page-break-after");
        pageBreakAfter = true;
      }

      // we check if the page is overflown
      if(this.checkOverflow(pageInner)) {
        this.d(">> this.checkOverflow == true");
        overflown = true;
      }

      // check if node needs its own page
      this.d(">> currNode.clientHeight = "+currNode.clientHeight+", maxHeight: "+maxHeight);
      if(currNode.clientHeight >= maxHeight * 0.9) {
        this.d(">>> currNode.clientHeight >= maxHeight * 0.9 = "+(maxHeight *0.9));
        currElementFitsOwnPage = true;
      }

      if(secCnt >= 30) {
        //throw(">>> Stopping Execution");
      }
      //headersBefore = 0;

      // -------- now we react dependent of the situation

      // if overflown and no other stuff is active
      if(overflown && !headersBefore && !currElementFitsOwnPage)
      {
        this.d(">>>> reacting to normal overflow");
        currNode.remove();
        contentDOM_ctr--;
        
        // create new page
        var pageInner = this.createNewPage(pagesDOM);
      }
      // If headers before and overflown
      else if(overflown && headersBefore > 0 && !currElementFitsOwnPage && !this.reversedHeadlines)
      {
        this.d(">>>> reacting to overflow with headlines before");
        this.d(">>>>> currNode: "+currNode.as);
        var secCntTmp = 1;
        currNode.remove();
        //var lastPage = pagesDOM.children[pagesDOM.children.length - 2].getElementsByClassName("page-inner")[0];
        var currPage = pagesDOM.children[pagesDOM.children.length - 1].getElementsByClassName("page-inner")[0];        

        while(this.isHeadline(currPage.children[currPage.children.length - 1]) && secCntTmp < 15) {
          currPage.children[currPage.children.length - 1].remove();
          contentDOM_ctr--;
          secCntTmp++;
        }
        var pageInner = this.createNewPage(pagesDOM);
        var currNode = contentDOM.children[contentDOM_ctr].cloneNode(true)
        pageInner.append(currNode);
        this.reversedHeadlines = true;
      }
      // if needs own page
      else if(currElementFitsOwnPage || (overflown && this.reversedHeadlines) )
      {
        this.d(">>>> reacting to currElementFitsOwnPage");
        // remove current node
        currNode.remove();
        contentDOM.children[contentDOM_ctr].remove();
        
        // create new page
        var pageInner = this.createNewPage(pagesDOM);

        // get currNode again and put it to new page
        var currNode = contentDOM.children[contentDOM_ctr - 1].cloneNode(true)
        var maxHeightFullEl = (maxHeight * 0.9) + "px";
        this.d(">>>> max height: "+maxHeightFullEl);
        currNode.style.maxHeight = maxHeightFullEl;
        pageInner.append(currNode);

        // create new page to keep going
        var pageInner = this.createNewPage(pagesDOM);
        this.reversedHeadlines = false;
      }
      else if (pageBreakBefore)
      {
        this.d(">>>> reacting to pageBreakBefore");
        currNode.remove();
        var currNode = contentDOM.children[contentDOM_ctr].cloneNode(true)
                
        // create new page
        var pageInner = this.createNewPage(pagesDOM);

        pageInner.append(currNode);
      }

      // -------- do header and footer stuff
      if(this.justCreatedNewPage)
      {
        //if(currElementFitsOwnPage) { var subh = 2; } else { var subh = 1; }
        var subh = 1;

        // header
        if(this.headerHeight > 0)
        {
          if(currElementFitsOwnPage)
          {
            this.d(">>>>> creating header on page before last page");
            var lastPage = pagesDOM.children[pagesDOM.children.length - 2];
            var pageHeader = document.getElementsByClassName("page-header")[0].cloneNode(true);
            pageHeader.classList.add("page-header");
            lastPage.prepend(pageHeader);
          }

          if(this.pageCnt >= this.headerStartPage)
          {
            this.d(">>>>> creating header on last page");
            var lastPage = pagesDOM.children[pagesDOM.children.length - 1];
            var pageHeader = document.getElementsByClassName("page-header")[0].cloneNode(true);
            pageHeader.classList.add("page-header");
            lastPage.prepend(pageHeader);
          }
        }
        // footer
        if(this.footerHeight > 0)
        {
          if(currElementFitsOwnPage)
          {
            this.d(">>>>> creating footer on page before last page");
            var lastPage = pagesDOM.children[pagesDOM.children.length - 2];
            var pageFooter = document.getElementsByClassName("page-footer")[0].cloneNode(true);
            pageFooter.classList.add("page-footer");
            lastPage.append(pageFooter);

            // create numbering
            pageFooter.getElementsByClassName("page-footer-page-current")[0].innerHTML = this.pageCnt - this.footerStartPage;
          }

          if(this.pageCnt >= this.footerStartPage)
          {
            this.d(">>>>> creating footer on last page");
            var lastPage = pagesDOM.children[pagesDOM.children.length - 1];
            var pageFooter = document.getElementsByClassName("page-footer")[0].cloneNode(true);
            pageFooter.classList.add("page-footer");
            lastPage.append(pageFooter);

            // create numbering
            pageFooter.getElementsByClassName("page-footer-page-current")[0].innerHTML = this.pageCnt - this.footerStartPage + 1;
          }
        }
        this.justCreatedNewPage = false;
      }
      contentDOM_ctr++;
    }

    // put the total pages num into all footers
    var pagesTotal = this.pageCnt - this.pageCountStart;
    var footers = pagesDOM.getElementsByClassName("page-footer");
    console.log("number of footers: "+footers.length);
    for(var f = 0; f < footers.length; f++) {
      console.log("page-footer-page-all found in this footer: "+footers[f].getElementsByClassName("page-footer-page-all").length);
      if(footers[f].getElementsByClassName("page-footer-page-all")[0] != undefined) {
        footers[f].getElementsByClassName("page-footer-page-all")[0].innerHTML = pagesTotal - this.pageCountStart;
      }
    }

    // iterate through all pages and set an <hr> in between
    if(false) {
      var pages = pagesDOM.children;
      console.log(pages);
      var sec = 0;

      for(var i = 0; i < pages.length && sec < 1000; i++)
      {
        if(pages[i].previousSibling != undefined) {
          console.log("prev sib tag: "+pages[i].previousSibling.tagName);
          if(pages[i].previousSibling.tagName != "BR") {
            var hr = document.createElement("BR");
            hr.classList.add("page-break-before");
            pagesDOM.insertBefore(hr, pages[i]);
          }
        }

        if(sec > 100) {
          break;
        }
        sec++;
      }
    }

    // set flag that we are finished
    this.unfinishedBusiness = false;

  }



  // -------------------------------- FUNCTIONAL HELPER AND ROUNDABOUT METHODS --------------------------------

  appendDebugTags(contentDOM) {
    console.log("> appending debug tags...");
    for(var i = 0; i < contentDOM.children.length; i++) {
      contentDOM.children[i].setAttribute("data-debug-id", i.toString());
    }
  }

  isHeadline(el) {
    if(el != undefined) {
      if(el.tagName == "H1"
      || el.tagName == "H2"
      || el.tagName == "H3"
      || el.tagName == "H4"
      || el.tagName == "H5"
      || el.tagName == "H6") {
        return true;
      }
    }
    return false;
  }

  createNewPage(pagesDOM) {
    this.justCreatedNewPage = true;
    this.pageCnt++;

    var page = document.createElement("div");
    page.classList.add("page");
    pagesDOM.appendChild(page);

    var pageMargin = document.createElement("div");
    pageMargin.classList.add("page-margin");
    page.append(pageMargin);

    var pageInner = document.createElement("div");
    pageInner.classList.add("page-inner");
    pageMargin.append(pageInner);
    
    return pageInner;
  }

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
        page-break-before:always;
        width:`+this.pageWidth+this.units+`;
        height:`+this.pageHeight+this.units+`;
        max-width:`+this.pageWidth+this.units+`;
        max-height:`+this.pageHeight+this.units+`;
      }
      .page-margin {
        padding-top:`+this.marginTop+this.units+`;
        padding-right:`+this.marginRight+this.units+`;
        padding-bottom:`+this.marginBottom+this.units+`;
        margin-left:`+this.marginLeft+this.units+`;
      }
      .page-inner {
        max-width:`+(this.pageWidth - this.marginLeft - this.marginRight)+this.units+`;
        max-height:`+(this.pageHeight - this.marginTop - this.marginBottom)+this.units+`;
      }
      .page-header {
        height:`+this.headerHeight+this.units+`;
        max-height:`+this.headerHeight+this.units+`;
        width:`+this.pageWidth+this.units+`;
        max-width:`+this.pageWidth+this.units+`;
      }
      .page-footer {
        height:`+this.footerHeight+this.units+`;
        max-height:`+this.footerHeight+this.units+`;
        width:`+this.pageWidth+this.units+`;
        max-width:`+this.pageWidth+this.units+`;
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

   //var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
   var isOverflowing = el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
  }


  // -------------------------------- OTHER METHODS / HELPERS --------------------------------

  d(m) {
    if(this.debug) { console.log(m); }
  }


}