function base64ArrayBuffer (arrayBuff) {
  var buff = new Uint8Array(arrayBuff)
  var text = ''
  for (var i = 0; i < buff.byteLength; i++) {
    text += String.fromCharCode(buff[i])
  }
  return btoa(text)
}

function extractFileExtension (filename) {
  return filename.substr((~-filename.lastIndexOf('.') >>> 0) + 2)
}

function escapeHtml (text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  }
  return text.replace(/[&<>"']/g, function (m) { return map[m] })
}
