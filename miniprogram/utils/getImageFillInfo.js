function getImageFillInfo ( type, info, dx = 0, dy = 0, tWidth, tHeight ) {
  let rw = 1
  let rh = 1
  let dw = tWidth
  let dh = tHeight
  let sw = info.width
  let sh = info.height
  let sx = 0
  let sy = 0
  switch ( type ) {
    case 'original':
      rw = info.width / tWidth
      dh = info.height / rw
      sw = info.width
      sh = info.height
      break;
    case 'adaptive window':
      break
    case 'adaptive image height':
      rh = info.height / tHeight
      dw = info.width / rh > tWidth ? tWidth : info.width / rh
      dx = dw < tWidth ? ( tWidth - dw ) / 2 + dx : dx
      sh = info.height
      sw = dw * ( sh / dh )
      sx = info.width > sw ? ( info.width - sw ) / 2 : 0
      sy = 0
      break
    case 'adaptive image width':
      rw = info.width / tWidth
      dh = info.height / rw > tHeight ? tHeight : info.height / rw
      dy = dh < tHeight ? ( tHeight - dh ) / 2 + dy : dy
      sw = info.width
      sh = dh * ( sw / dw )
      sx = 0
      sy = info.height > sh ? ( info.height - sh ) / 2 : 0
      break
    default:
        rw = info.width / tWidth
        dh = info.height / rw
        sw = info.width
        sh = info.height
      break
  }
  return { dx, dy, dw, dh, sx, sy, sw, sh }
}

module.exports = getImageFillInfo
