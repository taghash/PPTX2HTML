PPTX2HTML
==========

### Notes
- `npm i natives`: https://stackoverflow.com/a/51169853
- `primordials is not defined`: https://stackoverflow.com/a/58394828
- Migrating from gulp3 to gulp4
    - https://samhermes.com/posts/upgrading-from-gulp-3-to-4/
    - https://www.sitepoint.com/how-to-migrate-to-gulp-4/

[![MIT License][license-image]][license-url]
[![npm version][npm-image]][npm-url]

PPTX2HTML can convert MS-PPTX file to HTML by using pure javascript.
Support Chrome, Firefox, IE>=10 and Edge.
Here is the [Online DEMO] page.

Support Objects
----
* Text
  * Font size
  * Font family
  * Font style: blod, italic, underline
  * Color
  * Location
  * hyperlink
* Picture
  * Type: jpg/jpeg, png, gif
  * Location
* Graph
  * Bar chart
  * Line chart
  * Pie chart
* Table
  * Location
  * Size
* Text block (convert to Div)
  * Align (Horizontal and Vertical)
  * Background color (single color)
  * Border (borderColor, borderWidth, borderType, strokeDasharray)
* Drawing (convert to SVG)
  * Simple block (rect, ellipse, roundRect)
  * Background color (single color)
  * Align (Horizontal and Vertical)
  * Border (borderColor, borderWidth, borderType, strokeDasharray)
* Group/Multi-level Group
  * Level (z-index)
* Theme/Layout


License
----

MIT

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[npm-image]: https://img.shields.io/npm/v/pptx2html.svg?style=flat
[npm-url]: https://www.npmjs.com/package/pptx2html
[Online DEMO]: http://g21589.github.io/PPTX2HTML
