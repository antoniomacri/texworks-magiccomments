Description
===========

This script lets you insert or edit "magic comments" inside TeXworks with a friendly _User Interface_.

![TeXworks Magic comments](https://dl.dropbox.com/s/odt83jcnrdo786d/texworks-magiccomments.png "Edit magic comments...")

As you can see, TeXShop compatibility is also preserved, when possible.

The script supports the following comments:

* `encoding`: shows a list of supported encodings, possibly specifying a few aliases for each of them and the associated `inputenc`'s option.
* `program` or `TS-program` (TeXShop syntax): shows a list of _processing tools_. Starting from TeXworks r1024, this list is built dynamically using the processing tools actually available (those accessible from the drop-down list near to the _Typeset_ button in the main window). On previous versions of TeXworks, it shows a static list containing a set of predefined engines (note that in this case there's no guarantee that the engines in the list are actually recognized by TeXworks).
* `root`: shows all files currently opened in TeXworks (using path relative to the current file).
* `spellcheck`: shows a list of dictionaries. Starting from TeXworks r962, this list is built dynamically using all installed dictionaries. In older versions of TeXworks, it shows a static list with a few common languages (note that in this case the dictionary is not guaranteed to be recognized by TeXworks).

Of course, you can insert any value you want for magic comments, though provided list aims to contain only recognized values. For a complete list of supported values on your system for each option, you may refer to the TeXworks preferences.

_Thanks to Claudio Beccari and Tommaso Gordini, for all suggestions and for the help in finding TeXShop compatibility issues._


Installation instructions
=========================


Obtaining required files
------------------------

Download the following files:

* [magicComments.js](/antoniomacri/texworks-magiccomments/raw/master/magicComments.js)
* [magicComments.ui](/antoniomacri/texworks-magiccomments/raw/master/magicComments.ui)


Installing the script
---------------------

1. Open TeXworks
2. Go to menu _Scripts_→_Scripting TeXworks_
3. Select _Show Scripts Folder_: it will open a new window showing the folder in which all scripts reside
4. Do either one of the following:
    * Copy downloaded files directly into this folder: it will appear a new menu item _Edit magic comments..._ under the _Scripts_ menu
    * Create a new subfolder, for example "Magic comments", and copy downloaded files into it: it will appear a new submenu (with the same name as the subfolder) containing the menu item _Edit magic comments..._
5. Go to menu _Scripts_→_Reload Script List_

Be careful to put all files into the same folder.


Running the script
==================

Using menus:

* Go to _Scripts_→_Edit magic comments..._ or _Scripts_→_⟨Selected subfolder⟩_→_Edit magic comments..._

Via keyboard:

* Click `Ctrl+K,M` (that is, hold `Ctrl` key and press in sequence `K` and `M`)


Reporting issues
================

Please report any issue using the [issue tracker](/antoniomacri/texworks-magiccomments/issues).
