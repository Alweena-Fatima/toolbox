import QRCode from 'qrcode' //This imports the QRCode functionality from the installed library.

export async function generateQrFiles(data, foreground, background) { //foreground is color of qr code and background is color of background of qr code
  //this option object will store the qr custimization like color, margin and width of qr code
  const options = {
    color: {
      dark: foreground,
      light: background
    },
    margin: 2,
    width: 360
  }

  const png = await QRCode.toDataURL(data, options) //It generates a QR code and returns a Data URL(represents the image as a string.)
  //Because you can display an image directly in React without first saving it to your server.
  // This method converts the QR code into a string representation.
  
  const svg = await QRCode.toString(data, {
    ...options,
    type: 'svg'
  })

  return { png, svg }
}
