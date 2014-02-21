// TeXworksScript
// Title: Test "Edit magic comments..."
// Author: Antonio Macrì
// Version: 1.0
// Date: 2014-02-21
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+K, Ctrl+K, Ctrl+M

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


justLoad = null;


var Assert = (function() {
  var log = "";
  var totalTests = 0, failedTests = 0;
  return {
    equal: function(current, expected, message) {
      var passed = current == expected;
      totalTests++;
      failedTests += passed ? 0 : 1;
      if (!passed) {
        log += "<tr>";
        log += "<td style='background-color: " + (passed ? "green" : "red") + "'></td>";
        log += "<td valign='top'><font size=-2>";
        log += message + " == '" + current + "' (expected: '" + expected + "')";
        log += "</font></td>";
        log += "</tr>";
      }
    },
    report: function() {
      var html = "<html><body>";
      html += "Total tests: " + totalTests +
              ", Failed tests: " + failedTests + "<hr/>";
      html += "<table border='0' cellspacing='0' cellpadding='4'>";
      html += log;
      html += "</table></body></html>";
      return html;
    },
  };
})();


function runPathTests() {
  [
    [ "/a/b/c/file.tex", "file" ],
    [ "/a/b/file.tex", "file" ],
    [ "/a/file.tex", "file" ],
    [ "/file.tex", "file" ],
    [ "file.tex", "file" ],
    [ "file", "file" ],
    [ "file.1.tex", "file.1" ],
  ].forEach(function(s) {
    var fmt = "Path.getFileNameWithoutExtension('%0')";
    var fileName = Path.getFileNameWithoutExtension(s[0]);
    Assert.equal(fileName, s[1], fmt.format(s[0]));
  });

  [
    [ "/a/b/c/file.tex", "/a/b/c/" ],
    [ "/a/b/file.tex", "/a/b/" ],
    [ "/a/file.tex", "/a/" ],
    [ "/file.tex", "/" ],
    [ "file.tex", "." ],
    [ "F:/a/b/c/file.tex", "F:/a/b/c/" ],
    [ "F:/a/b/file.tex", "F:/a/b/" ],
    [ "F:/a/file.tex", "F:/a/" ],
    [ "F:/file.tex", "F:/" ],
    [ "file.tex", "." ],
  ].forEach(function(s) {
    var fmt = "Path.getParentFolder('%0')";
    var fileName = Path.getParentFolder(s[0]);
    Assert.equal(fileName, s[1], fmt.format(s[0]));
  });

  [
    [ "a/b/c/file.tex", ".", "a/b/c/file.tex" ],
    [ "a/b/c/file.tex", "./", "a/b/c/file.tex" ],
    [ "a/b/file.tex", ".", "a/b/file.tex" ],
    [ "a/b/file.tex", "./", "a/b/file.tex" ],
    [ "a/file.tex", ".", "a/file.tex" ],
    [ "a/file.tex", "./", "a/file.tex" ],
    [ "file.tex", ".", "file.tex" ],
    [ "file.tex", "./", "file.tex" ],
    [ "F:/a/b/c/file.tex", ".", "F:/a/b/c/file.tex" ],
    [ "F:/a/b/c/file.tex", "./", "F:/a/b/c/file.tex" ],
    [ "F:/a/b/file.tex", ".", "F:/a/b/file.tex" ],
    [ "F:/a/b/file.tex", "./", "F:/a/b/file.tex" ],
    [ "F:/a/file.tex", ".", "F:/a/file.tex" ],
    [ "F:/a/file.tex", "./", "F:/a/file.tex" ],
    [ "F:/file.tex", ".", "F:/file.tex" ],
    [ "F:/file.tex", "./", "F:/file.tex" ],
    [ "/a/b/c/file.tex", "/", "a/b/c/file.tex" ],
    [ "/a/b/file.tex", "/", "a/b/file.tex" ],
    [ "/a/file.tex", "/", "a/file.tex" ],
    [ "/file.tex", "/", "file.tex" ],
    [ "F:/a/b/c/file.tex", "F:", "a/b/c/file.tex" ],
    [ "F:/a/b/c/file.tex", "F:/", "a/b/c/file.tex" ],
    [ "F:/a/b/file.tex", "F:", "a/b/file.tex" ],
    [ "F:/a/b/file.tex", "F:/", "a/b/file.tex" ],
    [ "F:/a/file.tex", "F:", "a/file.tex" ],
    [ "F:/a/file.tex", "F:/", "a/file.tex" ],
    [ "F:/file.tex", "F:", "file.tex" ],
    [ "F:/file.tex", "F:/", "file.tex" ],
    [ "/a/b/c/file.tex", "/a", "b/c/file.tex" ],
    [ "/a/b/c/file.tex", "/a/", "b/c/file.tex" ],
    [ "/a/b/file.tex", "/a", "b/file.tex" ],
    [ "/a/b/file.tex", "/a/", "b/file.tex" ],
    [ "/a/file.tex", "/a", "file.tex" ],
    [ "/a/file.tex", "/a/", "file.tex" ],
    [ "/file.tex", "/a", "../file.tex" ],
    [ "/file.tex", "/a/", "../file.tex" ],
    [ "F:/a/b/c/file.tex", "F:/a", "b/c/file.tex" ],
    [ "F:/a/b/c/file.tex", "F:/a/", "b/c/file.tex" ],
    [ "F:/a/b/file.tex", "F:/a", "b/file.tex" ],
    [ "F:/a/b/file.tex", "F:/a/", "b/file.tex" ],
    [ "F:/a/file.tex", "F:/a", "file.tex" ],
    [ "F:/a/file.tex", "F:/a/", "file.tex" ],
    [ "F:/file.tex", "F:/a", "../file.tex" ],
    [ "F:/file.tex", "F:/a/", "../file.tex" ],
    [ "/a/b/c/file.tex", "/a/b", "c/file.tex" ],
    [ "/a/b/c/file.tex", "/a/b/", "c/file.tex" ],
    [ "/a/b/file.tex", "/a/b", "file.tex" ],
    [ "/a/b/file.tex", "/a/b/", "file.tex" ],
    [ "/a/file.tex", "/a/b", "../file.tex" ],
    [ "/a/file.tex", "/a/b/", "../file.tex" ],
    [ "/file.tex", "/a/b", "../../file.tex" ],
    [ "/file.tex", "/a/b/", "../../file.tex" ],
    [ "F:/a/b/c/file.tex", "F:/a/b", "c/file.tex" ],
    [ "F:/a/b/c/file.tex", "F:/a/b/", "c/file.tex" ],
    [ "F:/a/b/file.tex", "F:/a/b", "file.tex" ],
    [ "F:/a/b/file.tex", "F:/a/b/", "file.tex" ],
    [ "F:/a/file.tex", "F:/a/b", "../file.tex" ],
    [ "F:/a/file.tex", "F:/a/b/", "../file.tex" ],
    [ "F:/file.tex", "F:/a/b", "../../file.tex" ],
    [ "F:/file.tex", "F:/a/b/", "../../file.tex" ],
    [ "/a/b/c/file.tex", "/a/b/c", "file.tex" ],
    [ "/a/b/c/file.tex", "/a/b/c/", "file.tex" ],
    [ "/a/b/file.tex", "/a/b/c", "../file.tex" ],
    [ "/a/b/file.tex", "/a/b/c/", "../file.tex" ],
    [ "/a/file.tex", "/a/b/c", "../../file.tex" ],
    [ "/a/file.tex", "/a/b/c/", "../../file.tex" ],
    [ "/file.tex", "/a/b/c", "../../../file.tex" ],
    [ "/file.tex", "/a/b/c/", "../../../file.tex" ],
    [ "F:/a/b/c/file.tex", "F:/a/b/c", "file.tex" ],
    [ "F:/a/b/c/file.tex", "F:/a/b/c/", "file.tex" ],
    [ "F:/a/b/file.tex", "F:/a/b/c", "../file.tex" ],
    [ "F:/a/b/file.tex", "F:/a/b/c/", "../file.tex" ],
    [ "F:/a/file.tex", "F:/a/b/c", "../../file.tex" ],
    [ "F:/a/file.tex", "F:/a/b/c/", "../../file.tex" ],
    [ "F:/file.tex", "F:/a/b/c", "../../../file.tex" ],
    [ "F:/file.tex", "F:/a/b/c/", "../../../file.tex" ],
    [ "//a/b/c//file.tex", "/a//", "b/c/file.tex" ],
    [ "F://a/b/c//file.tex", "F:/a//", "b/c/file.tex" ],
  ].forEach(function(s) {
    var fmt = "Path.getRelativePath('%0', '%1')";
    var relPath = Path.getRelativePath(s[0], s[1]);
    Assert.equal(relPath, s[2], fmt.format(s[0], s[1]));
    relPath = Path.getRelativePath(s[0].replace("/", "\\"), s[1].replace("/", "\\"));
    Assert.equal(relPath, s[2], fmt.format(s[0], s[1]));
  });
}

var file = TW.readFile("magicComments.js");
if (file.status == 0) {
  eval(file.result);
  file = null;

  runPathTests();

  TW.result = Assert.report();
}
else {
  TW.warning(null, "", "Cannot load script \"magicComments.js\"!");
}
undefined;

