// TeXworksScript
// Title: Edit &magic comments...
// Description: Edit magic comments
// Author: Antonio Macrì
// Version: 0.9
// Date: 2012-09-02
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+K, Ctrl+M

/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


// Internationalization
var CANNOT_LOAD_FILE = "Cannot load \"%0\" (status: %1\).";
var CANNOT_CREATE_UI = "Cannot create the UI dialog.";


// Utility functions
String.prototype.format = function()
{
  var fmt = this;
  for (var i = 0; i < arguments.length; i++) {
    fmt = fmt.replace(new RegExp("%" + i, "g"), arguments[i]);
  }
  return fmt;
}

// String.trim was introduced in Qt 4.7
if(typeof(String.prototype.trim) == "undefined")
{
  String.prototype.trim = (function() {
    var re = /^[\s\n]+|[\s\n]+$/g;
    return function() { return this.replace(re, ""); };
  })();
}

// Used to escape paths
function EscapeXml(str)
{
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/</g, "&lt;");
  return str.replace(/>/g, "&gt;");
}


var TeXShopCompatibility = false;
var PEEK_LENGTH = 1024;  // from TeXworks' sources
var fmtMagicComment = "% !TeX %0 = %1\n";

var reSplit = new RegExp("[\\\\/]");
var breadcrumbs = TW.target.fileName.split(reSplit).slice(0,-1);


var EncodingList = [
  [ "UTF-8", "UTF-8 Unicode", "utf-8" ],
  [ "ISO-8859-1", "IsoLatin", "latin1" ],
  [ "Apple Roman", "MacOSRoman", "applemac" ],
];

function GetEngineList()
{
  // TW.getEngineList introduced in r1024
  if (!TW.getEngineList) {
    return null;
  }
  return TW.getEngineList().map(function (e) { return e.name; });
}

function GetDocumentList()
{
  return TW.app.getOpenWindows().filter(function(w) {
    return w.objectName == "TeXDocument";
  }).map(function(w) {
    var b = w.fileName.split(reSplit);
    var i = 0;
    while (i < breadcrumbs.length && b[i] == breadcrumbs[i]) {
      i++;
    }
    var result = b.slice(i).join('/');
    if (i < breadcrumbs.length) {
      result = new Array(breadcrumbs.length-i+1).join("../") + result;
    }
    return result;
  });
}

function GetDictionaryList()
{
  // TW.getDictionaryList introduced in r962
  if (!TW.getDictionaryList) {
    return null;
  }
  var result = [];
  var list = TW.getDictionaryList();
  for (var d in list) {
    // avoid multiple references to the same dictionary
    if (result.indexOf(list[d][0]) < 0) {
      result.push(list[d][0]);
    }
  }
  var reFileName = new RegExp("([^\\\\/]+)\\.[^.]+$");
  return result.map(function(o) { return reFileName.exec(o)[1]; });
}


function MagicComment(o)
{
  o.Regex = o.Regex || new RegExp("% *!TEX +" + o.Key + " *= *(.+)\\n", "i");
  o.ToDisplayValue = o.ToDisplayValue || function() { return this.Value; };
  o.FromDisplayValue = o.FromDisplayValue || function(v) { return v; };
  o.Produce = o.Produce || function() {
    return fmtMagicComment.format(this.Key, this.Value);
  };
  return o;
}


var magicComments = [
  MagicComment({
    Key: "encoding",
    List: EncodingList.map(function(l) {
      var index = TeXShopCompatibility ? 1 : 0;
      return l[index] + " (" + l[1-index] + ", " + l[2] + ")";
    }),
    ToDisplayValue: function() {
      var v = this.Value.toLowerCase();      
      for (var i=0; i < this.List.length; i++) {
        if (this.List[i].toLowerCase().indexOf(v) >= 0) {
          return this.List[i];
        }
      }
      return this.Value;
    },
    FromDisplayValue: function(v) {
      var m = /^(.+)\(.+\)\s*$/.exec(v);
      return m ? m[1].trim() : v;
    },
    Produce: function() {
      var v = this.Value.toLowerCase();
      var enc = EncodingList.filter(function(e) {
        return e.some(function(s) { return s.toLowerCase().indexOf(v) >= 0; });
      })[0];
      var index = TeXShopCompatibility ? 1 : 0;
      return fmtMagicComment.format(this.Key, enc ? enc[index] : this.Value);
    },
  }),
  MagicComment({
    Key: "program",
    Regex: /% *!TEX +(?:TS-)?program *= *(.+)\n/i,
    List: GetEngineList() || [
      "pdfLaTeX",
      "XeLaTeX",
      "LuaLaTeX",
      "pdfTeX",
      "XeTeX",
      "LuaTeX",
      "ConTeXt (LuaTeX)",
      "ConTeXt (pdfTeX)",
      "ConTeXt (XeTeX)",
      "BibTeX",
      "MakeIndex",
    ],
    Produce: function() {
      return fmtMagicComment.format(TeXShopCompatibility ?
        "TS-program" : "program", this.Value);
    },
  }),
  MagicComment({
    Key: "root",
    List: GetDocumentList(),
    Produce: function() {
      // On Unix systems, TeXworks requires slashes, not backslashes
      return fmtMagicComment.format(this.Key, this.Value.replace(/\\/g, '/'));
    },
  }),
  MagicComment({
    Key: "spellcheck",
    List: GetDictionaryList() || [
      "de_DE",
      "en_US",
      "es_ES",
      "fr_FR",
      "it_IT",
    ],
  }),
];


function ReadMagicCommentsFromDocument()
{
  // Actually, in TeXworks PEEK_LENGTH specifies
  // how many *bytes* (not chars) are parsed
  var header = TW.target.text.slice(0, PEEK_LENGTH);

  magicComments.forEach(function(o) {
    var m = o.Regex.exec(header);
    if (m) {
      o.Index = m.index;
      o.Length = m[0].length;
      o.Value = m[1].trim();
    }
  });
}


function WriteMagicCommentsToDocument()
{
  var offset = 0, last = 0;

  magicComments.sort(function(o1,o2) {
    // We first set/reset magic comments already present (which have an Index)
    // sorting in ascending order by Index
    // At last we add new magic comments (having Index undefined)
    var d1 = typeof(o1.Index) != "undefined";
    var d2 = typeof(o2.Index) != "undefined";
    return d1 && d2 ? o1.Index - o2.Index : d2 - d1;
  }).forEach(function(o) {
    var rep = o.Value ? o.Produce() : "";
    if (typeof(o.Index) != "undefined") {
      TW.target.selectRange(o.Index + offset, o.Length);
      last = o.Index + offset + rep.length;
      offset += rep.length - o.Length;
    }
    else if (o.Value) {
      TW.target.selectRange(last, 0);
      last = last + rep.length;
    }
    else {
      return;
    }
    // Avoid recording an undo operation if text is the same
    if (rep != TW.target.selection) {
      TW.target.insertText(rep);
    }
  });
}


function ShowDialog(ui_file)
{
  var xml = TW.readFile(ui_file);
  if(xml.status != 0) {
    TW.critical(null, "", CANNOT_LOAD_FILE.format(ui_file, xml.status));
    return false;
  }
  xml = xml.result;

  magicComments.forEach(function(o) {
    var list = "";
    for (var i = 0; i < o.List.length; i++) {
      list += "<item><property name=\"text\"><string>" +
        EscapeXml(o.List[i]) + "</string></property></item>";
    }
    xml = xml.replace("{list-" + o.Key + "}", list);
  });

  var dialog = TW.createUIFromString(xml);
  if (!dialog) {
    TW.critical(null, "", CANNOT_CREATE_UI);
    return false;
  }

  var cmb = [], chk = [];
  magicComments.forEach(function(o) {
    cmb[o.Key] = TW.findChildWidget(dialog, "cmb-" + o.Key);
    chk[o.Key] = TW.findChildWidget(dialog, "chk-" + o.Key);
    cmb[o.Key].editTextChanged.connect(function() {
      chk[o.Key].checked = true;
    });
    if (o.Value) {
      chk[o.Key].checked = true;
      cmb[o.Key].setEditText(o.ToDisplayValue());
    }
  });

  var chkTSCompatibility = TW.findChildWidget(dialog, "chkTSCompatibility");
  chkTSCompatibility.checked = TeXShopCompatibility;

  var result = dialog.exec() == 1;
  if (result) {
    TeXShopCompatibility = chkTSCompatibility.checked;
    magicComments.forEach(function(o) {
      o.Value = chk[o.Key].checked ?
        o.FromDisplayValue(cmb[o.Key].currentText.trim()) : "";
    });
  }
  return result;
}


if (typeof(justLoad) == "undefined") {
  ReadMagicCommentsFromDocument();
  if (ShowDialog("magicComments.ui")) {
    WriteMagicCommentsToDocument();
  }
}
undefined;
