// TeXworksScript
// Title: Edit &magic comments...
// Description: Edit magic comments
// Author: Antonio Macrì
// Version: 0.9.1
// Date: 2012-09-18
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


function GetEncodingList()
{
  return [
    // From inputenc:
    [ "UTF-8", "UTF-8 Unicode", "utf-8" ],
    [ "ISO-8859-1", "IsoLatin", "latin1" ],
    [ "ISO-8859-2", "IsoLatin2", "latin2" ],
    [ "ISO-8859-3", "", "latin3" ],
    [ "ISO-8859-4", "", "latin4" ],
    [ "ISO-8859-9", "IsoLatin5", "latin5" ],
    [ "ISO-8859-15", "IsoLatin9", "latin9" ],
    [ "ISO-8859-16", "", "latin10" ],
    [ "ISO-8859-1", "IsoLatin" ],
    [ "IBM850", "", "cp850" ],
    [ "Apple Roman", "MacOSRoman", "applemac" ],
    [ "Windows-1250", "", "cp1250" ],
    [ "Windows-1252", "", "cp1252", "ansinew" ],
    [ "Windows-1257", "", "cp1257" ],
    // Missing explicit support in TW:
    //   ascii, decmulti, cp852, cp858, cp437, cp437de, cp865, macce, next
    // Nota: ascii (7-bit) is included in ISO-8859-1 and UTF-8
    // From inputenx:
    [ "ISO-8859-5", "", "iso88595" ],
    [ "ISO-8859-8", "", "x-iso-8859-8" ],
    [ "ISO-8859-10", "", "x-latin6" ],
    [ "ISO-8859-13", "", "x-latin7" ],
    [ "ISO-8859-14", "", "x-latin8" ],
    [ "IBM866", "", "x-cp866" ],
    [ "Windows-1251", "Windows Cyrillic", "x-cp1251" ],
    [ "Windows-1255", "", "x-cp1255" ],
    [ "KOI8-R", "KOI8_R", "x-koi8-r" ],
    [ "Apple Roman", "MacOSRoman", "x-mac-roman" ],
    // Missing explicit support in TW:
    //   verbatim, atarist, cp855, mac-cyrillic
    // Nota: inputenx defines cp437de = cp437, dec-mcs = decmulti,
    //   mac-centeuro = macce, nextstep = next
  ].map(function(l) {
    TeXShopCompatibility && l[1] && l.splice(0, 2, l[1], l[0]);
    return l[0] + " (" + l.slice(l.indexOf("")+1 || 1).join(", ") + ")";
  });
}

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
    List: GetEncodingList(),
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
      // Rebuild the list in case TeXShopCompatibility has changed
      this.List = GetEncodingList();
      var v = this.FromDisplayValue(this.ToDisplayValue());
      return fmtMagicComment.format(this.Key, v);
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
