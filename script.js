/****
 * Preface
 ****/

// If console does not exist, fallback to alert if specified
var alertFallback = false;
if (typeof console === "undefined" || 
    typeof console.log === "undefined") {
  console = {};
  if (alertFallback) {
    console.log = function(msg) {
      alert(msg);
    };
  } else {
    console.log = function() {};
  }
}

// Short hand to getElement a la jQuery
function $(id) { return document.getElementById(id) };

// Get the current browser window size
function wndsize() {
  var w = 0; var h = 0;
  if(!window.innerWidth){ // IE
      if(!(document.documentElement.clientWidth == 0)) { //strict mode
          w = document.documentElement.clientWidth;
          h = document.documentElement.clientHeight;
      } else{ //quirks mode
          w = document.body.clientWidth;
          h = document.body.clientHeight;
      }
  } else {// w3c
      w = window.innerWidth;
      h = window.innerHeight;
  }
  return {width:w,height:h};
}

window.onload   = initLayout;

var aceEditor; // Global pointer to our editor

function initLayout() {
  console.log('init');
  
  aceEditor = ace.edit($('editorPane'));
  
  aceEditor.setTheme("ace/theme/spin");
  aceEditor.getSession().setMode("ace/mode/java");
  
  editorToDefault(); // Set default text in editor

}

/**
 * Running openJML
 **/


function jml(mode) {
  
  if ($('syntaxB').disabled)
    return;
  
  if (current_tab == undefined) {
    console.log('No file opened.');
    return;
  }
  
  $('loading').style.display = 'inline';
  $('syntaxB').disabled = true;
  $('escB').disabled = true;
  
  clearHighlight();
  aceEditor.getSession().clearAnnotations();
  var name = current_tab.name;
  
  var data = encodeURIComponent(aceEditor.getValue());
  var postString = "source=" + data + "&mode=" + mode + "&name=" + encodeURIComponent(name);
  console.log(postString);
  
  var xmlhttp;
  if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
  else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      console.log(xmlhttp.responseText);
      $('loading').style.display = 'none';
      $('syntaxB').disabled = false;
      $('escB').disabled = false;
      parseOutput(xmlhttp.responseText);
    }
  };
  xmlhttp.open("POST","openjml.php",true);
  xmlhttp.setRequestHeader("Content-type",
                           "application/x-www-form-urlencoded");
  xmlhttp.send(postString);
  
  console.log('Running...');
}

// Very simplistic error highlighting

String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

function parseOutput(str) {

  var lines = str.split("\n");
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("error:") > 0) { // Syntax ?
      var line = lines[i].split(":")[1] - 0;
      var msg  = "<b>- " + lines[i].split(":")[3].replace(/</g,'&lt;')
                 + "</b>\n" + lines[i+1].replace(/</g,'&lt;')
                 + "\n" + lines[i+2].replace(/</g,'&lt;');
      var col  = lines[i+2].indexOf('^') + 1;
      extendAnnotations({
        'row'    : line -1, 
        'column' : col,
        'html'   : msg.replace(/  /g, '&nbsp;&nbsp;'), 
        'type'   : "error"
      });
      var to = lines[i+1].regexIndexOf(/[^a-zA-Z0-9_\-]/,col);
      if (to == -1) to = lines[i+1].length;
      highlightBlock(line, col, line, to, 'error');
    }
    if (lines[i].indexOf("warning:") > 0) { // Yices ?
      var line = lines[i].split(":")[1] - 0;
      var msg  = "<b>- " + getMessage(lines[i])
                 + "</b>\n" + lines[i+1].replace(/</g,'&lt;')
                 + "\n" + lines[i+2].replace(/</g,'&lt;');
      var col  = lines[i+2].indexOf('^') + 1;
      extendAnnotations({
        'row'    : line -1, 
        'column' : col,
        'html'   : msg.replace(/  /g, '&nbsp;&nbsp;'), 
        'type'   : "warning"
      });
      var to = lines[i+1].regexIndexOf(/[^a-zA-Z0-9_\-]/,col);
      if (to == -1) to = lines[i+1].length;
      highlightBlock(line, col, line, to, 'warning');
    } 
    if (lines[i].indexOf("Process timed out") >= 0) { // Timeout
      alert(lines[i]);
    }
  }
}

function getMessage(string) {
  var colon = string.indexOf(":");
  colon = string.indexOf(":", colon+1);
  colon = string.indexOf(":", colon+1);
  return string.substring(colon+1);
}

function extendAnnotations(ann) {
  var all = aceEditor.getSession().getAnnotations();
  console.log(all);
  if (all.push) {
    all.push(ann);
    aceEditor.getSession().setAnnotations(all);
  }
  else
    aceEditor.getSession().setAnnotations([ann]);
  /*
  for (var i = 0; i < all.length; i++) {
    if (all[i].row == ann.row) {
      ann.text = all[i].text + '\n' + ann.text 
      aceEditor.getSession().setAnnotations(ann);
    }
  }
  */
      
}

// HIGHLIGHTING

var hlmarkers = [];

/**
* Mark the requested line
**/
function highlightLine (line, lbl) {
  highlightBlock(line,0,line+1,0,lbl);
}
/**
* Mark the requested block
**/
function highlightBlock(rowStart, columnStart, rowEnd, columnEnd, lbl){
  var Range = ace.require('ace/range').Range;
  hlmarkers.push(aceEditor.getSession().addMarker(
      new Range(rowStart-1, columnStart-1, rowEnd-1, columnEnd), 
          lbl, "th"));
}
/**
* Clear the highlighted part
**/
function clearHighlight(){
  for (var i = 0; i < hlmarkers.length; i ++)
    aceEditor.getSession().removeMarker(hlmarkers[i]);
  hlmarkers = [];
}

/**
 * TAB MANAGEMENT
 **/

var tab_counter = 0;
var current_tab = undefined;
function Tab(name, content) {
  this.id = 'tab' + tab_counter;
  this.content = content;
  this.name = name;
  
  tab_counter += 1;
  this.span = document.createElement('span');
  $('filetabsPane').insertBefore(this.span, $('addFile'));
  var a = document.createElement('a');
  this.span.appendChild(a);
  a.setAttribute('href','javascript:void(0)');
  a.setAttribute('onclick','openTab("' + this.id + '")');
  a.innerHTML = name;
  var img = document.createElement('img');
  img.setAttribute('src','img/close.png');
  img.setAttribute('onclick','deleteTab("' + this.id + '")');
  // bogus link for hover effect
  var ab = document.createElement('a');
  ab.setAttribute('href','javascript:void(0)');
  ab.appendChild(img);
  this.span.appendChild(ab);
  tabs[this.id] = this;
  openTab(this.id);
}
var tabs = [];
function openTab(tab) {
  if (current_tab != undefined) {
    // store old content
    current_tab.content = aceEditor.getValue();
    current_tab.span.setAttribute('class','');
  }
  console.log("opening " + tab);
  current_tab = tabs[tab];
  current_tab.span.setAttribute('class','openTab');
  aceEditor.setValue(current_tab.content);
  aceEditor.navigateFileStart();
}
function addTab() {
  var name = prompt("Enter file name without extension","MyFile");
  if (name!=null && name!="") {
    new Tab(name + ".java", "");
  }
}
function deleteTab(tab) {
  var r = confirm("Are you sure you want to delete " + 
  tabs[tab].name + "?");
  if (r) {
    tabs[tab].span.parentNode.removeChild(tabs[tab].span);
    delete tabs[tab];
    for (var i in tabs) {
      console.log(i);
      openTab(i);
      return;
    }
    editorToDefault();
  }
}
function editorToDefault() {
  current_tab = undefined;
  aceEditor.setValue("/**\n *\n * To start, create a new file by "
      + "clicking the (+) button, or open a file by "
      + "\n * using the links in the top left corner.\n *\n **/");
  aceEditor.navigateFileStart();
}

function openExample(source, name) {
  var xmlhttp;
  if (window.XMLHttpRequest) 
    xmlhttp = new XMLHttpRequest();
  else // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
      new Tab(name, xmlhttp.responseText);
  };
  xmlhttp.open("GET",source,true);
  xmlhttp.send();
  
}

/* POPUPS */

function show(d) {
  $(d).style.display = 'block';
}

function hide(d) {
  $(d).style.display = 'none';
}
