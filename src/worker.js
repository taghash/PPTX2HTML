/* global self */
'use strict'

import pptx2html from './pptx2html'

pptx2html(
  func => { self.onmessage = e => func(e.data) },
  msg => self.postMessage(msg)
)
