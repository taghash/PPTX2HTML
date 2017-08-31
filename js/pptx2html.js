/* global $, JSZipUtils, Blob, FileReader, Worker, localStorage, alert, LZString, nv, d3 */
'use strict'

$(document).ready(function () {
  if (window.Worker) {
    let worker
    const $result = $('#result')
    let isDone = false

    $result.html('')
    $('#result_block').removeClass('hidden').addClass('show')

    // Read the file

    const loadFile = function (url, callback) {
      JSZipUtils.getBinaryContent(url, callback)
    }

    loadFile('Sample_12.pptx', function (err, content) {
      if (err) return console.error(err)
      const blob = new Blob([content])
      const reader = new FileReader()
      reader.onload = function (fileEvent) {
        // Web Worker
        worker = new Worker('./js/worker.js')

        worker.addEventListener('message', function (workerEvent) {
          const msg = workerEvent.data

          switch (msg.type) {
            case 'slide':
              $result.append(msg.data)
              break
            case 'processMsgQueue':
              processMsgQueue(msg.data)
              break
            case 'pptx-thumb':
              $('#pptx-thumb').attr('src', 'data:image/jpeg;base64,' + msg.data)
              break
            case 'slideSize':
              if (localStorage) {
                localStorage.setItem('slideWidth', msg.data.width)
                localStorage.setItem('slideHeight', msg.data.height)
              } else {
                alert('Browser don\'t support Web Storage!')
              }
              break
            case 'globalCSS':
              $result.append('<style>' + msg.data + '</style>')
              break
            case 'ExecutionTime':
              // var script = document.createElement('script');
              // script.src = "js/numeric.js";
              // script.async = true;
              // document.head.appendChild(script);
              isDone = true
              worker.postMessage({
                'type': 'getMsgQueue'
              })
              break
            case 'WARN':
              // console.warn('Worker: ', msg.data);
              break
            case 'ERROR':
              // console.error('Worker: ', msg.data);
              $('#error_block').text(msg.data)
              break
            case 'DEBUG':
              // console.debug('Worker: ', msg.data);
              break
            case 'INFO':
            default:
            // console.info('Worker: ', msg.data);
          }
        }, false)

        worker.postMessage({
          'type': 'processPPTX',
          'data': fileEvent.target.result
        })
      }
      reader.readAsArrayBuffer(blob)
    })

    $('#to-reveal-btn').click(function () {
      if (localStorage) {
        localStorage.setItem('slides', LZString.compressToUTF16($result.html()))
        window.open('./reveal/demo.html', '_blank')
      } else {
        alert('Browser don\'t support Web Storage!')
      }
    })
    const stopWorker = setInterval(function () {
      if (isDone) {
        worker.terminate()
        worker = undefined
        // console.log("worker terminated");
        clearInterval(stopWorker)
        setNumericBullets($('.block'))
        setNumericBullets($('table td'))
      }
    }, 500)
  } else {
    alert('Browser don\'t support Web Worker!')
  }
})

function processMsgQueue (queue) {
  for (let i = 0; i < queue.length; i++) {
    processSingleMsg(queue[i].data)
  }
}

function processSingleMsg (d) {
  const chartID = d.chartID
  const chartType = d.chartType
  const chartData = d.chartData

  let data = []

  let chart = null
  switch (chartType) {
    case 'lineChart':
      data = chartData
      chart = nv.models.lineChart()
        .useInteractiveGuideline(true)
      chart.xAxis.tickFormat(x => chartData[0].xlabels[x] || x)
      break
    case 'barChart':
      data = chartData
      chart = nv.models.multiBarChart()
      chart.xAxis.tickFormat(x => chartData[0].xlabels[x] || x)
      break
    case 'pieChart':
    case 'pie3DChart':
      data = chartData[0].values
      chart = nv.models.pieChart()
      break
    case 'areaChart':
      data = chartData
      chart = nv.models.stackedAreaChart()
        .clipEdge(true)
        .useInteractiveGuideline(true)
      chart.xAxis.tickFormat(x => chartData[0].xlabels[x] || x)
      break
    case 'scatterChart':

      for (let i = 0; i < chartData.length; i++) {
        const arr = []
        for (let j = 0; j < chartData[i].length; j++) {
          arr.push({x: j, y: chartData[i][j]})
        }
        data.push({key: 'data' + (i + 1), values: arr})
      }

      // data = chartData;
      chart = nv.models.scatterChart()
        .showDistX(true)
        .showDistY(true)
        .color(d3.scale.category10().range())
      chart.xAxis.axisLabel('X').tickFormat(d3.format('.02f'))
      chart.yAxis.axisLabel('Y').tickFormat(d3.format('.02f'))
      break
    default:
  }

  if (chart !== null) {
    d3.select('#' + chartID)
      .append('svg')
      .datum(data)
      .transition().duration(500)
      .call(chart)

    nv.utils.windowResize(chart.update)
  }
}

function setNumericBullets (elem) {
  const paragraphsArray = elem
  for (let i = 0; i < paragraphsArray.length; i++) {
    const buSpan = $(paragraphsArray[i]).find('.numeric-bullet-style')
    if (buSpan.length > 0) {
      // console.log("DIV-"+i+":");
      let prevBultTyp = ''
      let prevBultLvl = ''
      let buletIndex = 0
      const tmpArry = []
      let tmpArryIndx = 0
      const buletTypSrry = []
      for (let j = 0; j < buSpan.length; j++) {
        const bulletType = $(buSpan[j]).data('bulltname')
        const bulletLvl = $(buSpan[j]).data('bulltlvl')
        // console.log(j+" - "+bult_typ+" lvl: "+bult_lvl );
        if (buletIndex === 0) {
          prevBultTyp = bulletType
          prevBultLvl = bulletLvl
          tmpArry[tmpArryIndx] = buletIndex
          buletTypSrry[tmpArryIndx] = bulletType
          buletIndex++
        } else {
          if (bulletType === prevBultTyp && bulletLvl === prevBultLvl) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            buletIndex++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bulletType
          } else if (bulletType !== prevBultTyp && bulletLvl === prevBultLvl) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            tmpArryIndx++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bulletType
            buletIndex = 1
          } else if (bulletType !== prevBultTyp && Number(bulletLvl) > Number(prevBultLvl)) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            tmpArryIndx++
            tmpArry[tmpArryIndx] = buletIndex
            buletTypSrry[tmpArryIndx] = bulletType
            buletIndex = 1
          } else if (bulletType !== prevBultTyp && Number(bulletLvl) < Number(prevBultLvl)) {
            prevBultTyp = bulletType
            prevBultLvl = bulletLvl
            tmpArryIndx--
            buletIndex = tmpArry[tmpArryIndx] + 1
          }
        }
        // console.log(buletTypSrry[tmpArryIndx]+" - "+buletIndex);
        const numIdx = getNumTypeNum(buletTypSrry[tmpArryIndx], buletIndex)
        $(buSpan[j]).html(numIdx)
      }
    }
  }
}

function getNumTypeNum (numTyp, num) {
  let rtrnNum = ''
  switch (numTyp) {
    case 'arabicPeriod':
      rtrnNum = num + '. '
      break
    case 'arabicParenR':
      rtrnNum = num + ') '
      break
    case 'alphaLcParenR':
      rtrnNum = alphaNumeric(num, 'lowerCase') + ') '
      break
    case 'alphaLcPeriod':
      rtrnNum = alphaNumeric(num, 'lowerCase') + '. '
      break

    case 'alphaUcParenR':
      rtrnNum = alphaNumeric(num, 'upperCase') + ') '
      break
    case 'alphaUcPeriod':
      rtrnNum = alphaNumeric(num, 'upperCase') + '. '
      break

    case 'romanUcPeriod':
      rtrnNum = romanize(num) + '. '
      break
    case 'romanLcParenR':
      rtrnNum = romanize(num) + ') '
      break
    case 'hebrew2Minus':
      rtrnNum = hebrew2Minus.format(num) + '-'
      break
    default:
      rtrnNum = num
  }
  return rtrnNum
}

function romanize (num) {
  if (!+num) return false
  const digits = String(+num).split('')
  const key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']
  let roman = ''
  let i = 3
  while (i--) roman = (key[+digits.pop() + (i * 10)] || '') + roman
  return (new Array(+digits.join('') + 1)).join('M') + roman
}

const hebrew2Minus = archaicNumbers([
  [1000, ''],
  [400, 'ת'],
  [300, 'ש'],
  [200, 'ר'],
  [100, 'ק'],
  [90, 'צ'],
  [80, 'פ'],
  [70, 'ע'],
  [60, 'ס'],
  [50, 'נ'],
  [40, 'מ'],
  [30, 'ל'],
  [20, 'כ'],
  [10, 'י'],
  [9, 'ט'],
  [8, 'ח'],
  [7, 'ז'],
  [6, 'ו'],
  [5, 'ה'],
  [4, 'ד'],
  [3, 'ג'],
  [2, 'ב'],
  [1, 'א'],
  [/יה/, 'ט״ו'],
  [/יו/, 'ט״ז'],
  [/([א-ת])([א-ת])$/, '$1״$2'],
  [/^([א-ת])$/, '$1׳']
])

function archaicNumbers (arr) {
  // const arrParse = arr.slice().sort(function (a, b) { return b[1].length - a[1].length })
  return {
    format: function (n) {
      let ret = ''
      $.each(arr, function () {
        const num = this[0]
        if (parseInt(num) > 0) {
          for (; n >= num; n -= num) ret += this[1]
        } else {
          ret = ret.replace(num, this[1])
        }
      })
      return ret
    }
  }
}

function alphaNumeric (num, upperLower) {
  num = Number(num) - 1
  let aNum = ''
  if (upperLower === 'upperCase') {
    aNum = (((num / 26 >= 1) ? String.fromCharCode(num / 26 + 64) : '') + String.fromCharCode(num % 26 + 65)).toUpperCase()
  } else if (upperLower === 'lowerCase') {
    aNum = (((num / 26 >= 1) ? String.fromCharCode(num / 26 + 64) : '') + String.fromCharCode(num % 26 + 65)).toLowerCase()
  }
  return aNum
}
