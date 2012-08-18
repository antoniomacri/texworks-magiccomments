// TeXworksScript
// Title: Edit &magic comments...
// Description: Edit magic comments
// Author: Antonio Macrì
// Version: 0.8
// Date: 2012-08-18
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


var CANNOT_LOAD_FILE = "Cannot load \"%0\" (status: %1\).";
var CANNOT_CREATE_UI = "Cannot create the UI dialog.";


// String.trim was introduced in Qt 4.7
if(typeof(String.prototype.trim) == "undefined")
{
  String.prototype.trim = (function() {
    var re = /^[\s\n]+|[\s\n]+$/g;
    return function() { return this.replace(re, ""); };
  })();
}

String.prototype.format = function()
{
  var fmt = this;
  for (var i = 0; i < arguments.length; i++) {
    fmt = fmt.replace(new RegExp("%" + i, "g"), arguments[i]);
  }
  return fmt;
}


var PEEK_LENGTH = 1024;                    // from TeXworks' sources
var fmtMagicComment = "% !TeX %0 = %1\n";  // used to write options

var reSplit = new RegExp("[\\\\/]");
var breadcrumbs = TW.target.fileName.split(reSplit).slice(0,-1);

var options = [
  {
    Key: "encoding",
    Regex: new RegExp("% *!TEX +encoding *= *(.+)\\n", "i"),
    List: [
      "UTF-8 (utf-8)",
      "ISO-8859-1 (latin1)",
      "Apple Roman (applemac)",
    ],
    ToDisplayValue: function() {
      var re = /^(.+)\(.+\)\s*$/;
      for (var i=0; i < this.List.length; i++) {
        var m = re.exec(this.List[i]);
        if (m && m[1].trim() == this.Value) {
          return this.List[i];
        }
      }
      return this.Value;
    },
    FromDisplayValue: function(v) {
      var re = /^(.+)\(.+\)\s*$/;
      var m = re.exec(v);
      return this.Value = m ? m[1].trim() : v.trim();
    },
  },
  {
    Key: "program",
    Regex: new RegExp("% *!TEX +(?:TS-)?program *= *(.+)\\n", "i"),
    List: [
      "pdfLaTeX",
      "XeLaTeX",
      "LuaLaTeX",
      "pdfTeX",
      "XeTeX",
      "LuaTeX",
      "ConTeXt (LuaTeX)",
      "ConTeXt (pdfTeX)",
      "ConTeXt (XeTeX)",
      "LaTeXmk",
      "BibTeX",
      "Biber",
      "MakeIndex",
    ],
  },
  {
    Key: "root",
    Regex: new RegExp("% *!TEX +root *= *(.+)\\n", "i"),
    List: (function() {
      return TW.app.getOpenWindows().filter(function(w) {
        return w.objectName == "TeXDocument";
      }).map(function(w) {
        return w.fileName.split(reSplit);
      }).map(function(b) {
        var i = 0;
        while (i < breadcrumbs.length && b[i] == breadcrumbs[i])
          i++;
        var result = b.slice(i).join('/');
        if (i < breadcrumbs.length)
          result = new Array(breadcrumbs.length-i+1).join("../") + result;
        return result;
      });
    })(),
    BeforeWrite: function() {
      // On Unix systems, TeXworks requires slashes, not backslashes
      return this.Value = this.Value.replace(/\\/g, '/');
    },
  },
  {
    Key: "spellcheck",
    Regex: new RegExp("% *!TEX +spellcheck *= *(.+)\\n", "i"),
    // TW.getDictionaryList introduced in r962
    List: !TW.getDictionaryList ? [
      "de_DE (Deutsch)",
      "en_US (English)",
      "es_ES (Español)",
      "fr_FR (Français)",
      "it_IT (Italiano)",
    ] : (function() {
      var result = [];
      var list = TW.getDictionaryList();
      for (var d in list) {
        // avoid multiple references to the same dictionary
        if (result.indexOf(list[d][0]) < 0)
          result.push(list[d][0]);
      }
      var reFileName = new RegExp("([^\\\\/]+)\\.[^.]+$");
      return result.map(function(o) { return reFileName.exec(d)[1]; });
    })(),
  },
];


function EscapeXml(str)
{
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/</g, "&lt;");
  return str.replace(/>/g, "&gt;");
}


function ReadSettingsFromDocument()
{
  // Actually, in TeXworks PEEK_LENGTH specifies
  // how many *bytes* (not chars) are parsed
  var header = TW.target.text.slice(0, PEEK_LENGTH);

  options.forEach(function(o) {
    var m = o.Regex.exec(header);
    if (m) {
      o.Index = m.index;
      o.Length = m[0].length;
      o.Value = m[1].trim();
    }
  });
}


function WriteSettingsToDocument()
{
  var offset = 0, last = 0;

  options.sort(function(o1,o2) {
    // We first set/reset options already present (which have an Index)
    // sorting in ascending order by Index
    // At last we add new options (having Index undefined)
    var d1 = typeof(o1.Index) != "undefined";
    var d2 = typeof(o2.Index) != "undefined";
    return d1 && d2 ? o1.Index - o2.Index : d2 - d1;
  }).forEach(function(o) {
    if (o.Value && o.BeforeWrite) {
      o.BeforeWrite();
    }
    var rep = o.Value ? fmtMagicComment.format(o.Key, o.Value) : ""; 
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
    if (rep != TW.target.selection) {
      // Avoid recording an undo operation
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

  options.forEach(function(o) {
    var list = "";
    for (var i = 0; i < o.List.length; i++) {
      list += "<item><property name=\"text\"><string>" + EscapeXml(o.List[i]) + "</string></property></item>";
    }
    xml = xml.replace("{list-" + o.Key + "}", list);
  });

  var dialog = TW.createUIFromString(xml);
  if (!dialog) {
    TW.critical(null, "", CANNOT_CREATE_UI);
    return false;
  }

  var cmb = [], chk = [];

  options.forEach(function(o) {
    cmb[o.Key] = TW.findChildWidget(dialog, "cmb-" + o.Key);
    chk[o.Key] = TW.findChildWidget(dialog, "chk-" + o.Key);
    cmb[o.Key].editTextChanged.connect(function() {
      chk[o.Key].checked = true;
    });
    if (o.Value) {
      chk[o.Key].checked = true;
      cmb[o.Key].setEditText(o.ToDisplayValue ? o.ToDisplayValue() : o.Value);
    }
  });

  var result = dialog.exec() == 1;

  if (result) {
    options.forEach(function(o) {
      if (chk[o.Key].checked) {
        o.Value = cmb[o.Key].currentText.trim();
        if (o.FromDisplayValue)
          o.Value = o.FromDisplayValue(o.Value);
      }
      else {
        o.Value = "";
      }
    });
  }

  try {
    dialog.deleteLater();
    options.forEach(function(o) {
      cmb[o.Key].deleteLater();
    });
  } catch (e) {}

  return result;
}


if (typeof(justLoad) == "undefined") {
  ReadSettingsFromDocument();
  if (ShowDialog("magicComments.ui")) {
    WriteSettingsToDocument();
  }
}
undefined;

