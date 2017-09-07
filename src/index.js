'use strict'

import $ from 'jquery'
import JSZipUtils from 'jszip-utils'
import renderPptx from './main'

$(document).ready(function () {
  $('#result_block').removeClass('hidden').addClass('show')

  // Read the file
  JSZipUtils.getBinaryContent('test.pptx', (err, content) => {
    if (err) return console.error(err)
    renderPptx(content, '#result')
      .then(() => console.log('ALL DONE !'))
  })
})
