//Image Toolkit – imageUtils.js


// =====================================================
// 1. SUPPORTED IMAGE FORMATS
// =====================================================

// Image MIME type ko uske file extension se map kar rahe hain.

export const EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
}


// =====================================================
// 2. FORMAT FILE SIZE
// =====================================================

// File size bytes mein hota hai.
// Is function se bytes ko B, KB ya MB mein convert karenge. 
export const formatBytes = (bytes) => {

  if (bytes < 1024) {
    return bytes + ' B'
  }
  if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + ' KB'
  }
  return (bytes / 1048576).toFixed(2) + ' MB'
}




// Browser mein Blob se file download karne ke liye.

export const download = (blob, fileName) => {

  const link = document.createElement('a')
  // Blob ka temporary URL generate karo.
  link.href = URL.createObjectURL(blob)

  // Download hone wali file ka naam set karo.
  link.download = fileName

  // Programmatically click karke download start karo.
  link.click()
  setTimeout(() => {
    URL.revokeObjectURL(link.href)
  }, 1000)
}


// =====================================================
// 4. LOAD IMAGE
// =====================================================


export const loadImage = (file) => {

  return new Promise((resolve, reject) => {

    // Image file ke liye temporary URL create karo.
    const imageUrl = URL.createObjectURL(file)
    // Browser mein ek new Image object create karo.
    const image = new Image()

    // Jab image successfully load ho jaaye. then release temp url and return the image
    image.onload = () => {
      URL.revokeObjectURL(imageUrl)
      resolve(image)
    }


    // Agar image load nahi ho paayi. then also relase the url and return error mshg
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(
        new Error('Could not read this image. Is it a valid image file?')
      )
    }
    image.src = imageUrl
  })
}


// =====================================================
// 5. RENDER IMAGE USING CANVAS
// =====================================================

// Canvas API ka use karke image ko:
// 1. Resize kar sakte hain.
// 2. Format convert kar sakte hain.
// 3. Quality change kar sakte hain.
//
// Ye function Blob aur final image dimensions return karta hai.

export const renderImage = async (file, options) => {

  // Options se required values extract karo.
  const width = options.width
  const height = options.height

  // Agar format nahi diya toh JPEG use hoga.
  const type = options.type || 'image/jpeg'

  // Default quality 0.8 yani 80% hai.
  const quality = options.quality === undefined
    ? 0.8
    : options.quality

  // Original image ko browser mein load karo.
  const image = await loadImage(file)


  // Final width, height calculate karo.
  // Agar custom width,height nahi di toh original width,height use hogi.
  const finalWidth = Math.round(
    width || image.naturalWidth
  )
  const finalHeight = Math.round(
    height || image.naturalHeight
  )


  // crate a canvas element in the browser and set with and height of canvas to final width and height 
  const canvas = document.createElement('canvas')
  canvas.width = finalWidth
  canvas.height = finalHeight

  //get canvas 2d context to draw the image on canvas
  const context = canvas.getContext('2d')
  // JPEG format transparency support nahi karta.
  // Isliye JPEG export karne se pehle white background add karo.

  if (type === 'image/jpeg') {

    context.fillStyle = '#fff'

    // Canvas ko white colour se fill karo.
    context.fillRect(
      0,
      0,
      finalWidth,
      finalHeight
    )
  }
  //draw the image on cavas with final width and height

  context.drawImage(
    image,
    0,
    0,
    finalWidth,
    finalHeight
  )
  //now to show our image in browser we need to convert the cavas image to bolb

  const blob = await new Promise((resolve) => {

    canvas.toBlob(
      resolve,
      type,
      quality
    )

  })


  // Check karo ki Blob successfully create hua ya nahi.

  if (!blob || blob.type !== type) {

    // MIME type se extension find karo.
    const extension = EXT[type] || 'this format'

    throw new Error(
      `Your browser can't export ${extension.toUpperCase()}. Try another format.`
    )
  }
  //RETURN THE FINAL IMAGE 
  return {
    blob: blob,
    width: finalWidth,
    height: finalHeight
  }
}


// =====================================================
// 6. COMPRESS IMAGE
// =====================================================

// Image compression ke liye renderImage() reuse kar rahe hain.
// Quality kam karne se generally file size kam hota hai.

export const compressImage = (file, options) => { //option mein kish quality and type me chahiye wo store hota hai 

  return renderImage(file, {
    quality: options.quality,
    type: options.type
  })

}


// =====================================================
// 7. CONVERT IMAGE FORMAT
// =====================================================



export const convertImage = (file, type) => {

  return renderImage(file, {
    type: type,
    quality: 0.92
  })

}


// =====================================================
// 8. RESIZE IMAGE
// =====================================================


export const resizeImage = async (file, options) => {

  // Original image load karo.
  const image = await loadImage(file)

  const aspectRatio = image.naturalHeight / image.naturalWidth


  // User ki entered width aur height ko numbers mein convert karo.
  // Agar value empty hai toh 0 use hoga.

  let width = Number(options.width) || 0
  let height = Number(options.height) || 0
  if (!width && !height) {

    throw new Error('Enter a width or a height.')

  }


  // Agar aspect ratio maintain karna hai. automatically calculate the other dimension based on the aspect ratio of original image
  if (options.keepRatio) {

    if (width) {
      height = width * aspectRatio
    } else {
      width = height / aspectRatio

    }

  }


  // Original image ka format supported hai toh wahi use karo.
  // Otherwise PNG format use karo.

  const type = EXT[file.type]
    ? file.type
    : 'image/png'


  // Updated dimensions ke saath image render karo.
  return renderImage(file, {
    width: width || image.naturalWidth,
    height: height || image.naturalHeight,
    type: type,
    quality: 0.92

  })

}


// =====================================================
// 9. FILE TO DATA URL
// =====================================================

// File ko Base64 Data URL mein convert karta hai.
// Useful for displaying image data or embedding it in HTML.

export const fileToDataURL = (file) => {

  return new Promise((resolve, reject) => {

    // FileReader object create karo.
    const reader = new FileReader()
    // Jab file successfully read ho jaayeGenerated Data URL return karo.
    reader.onload = () => {

      resolve(reader.result)

    }
    reader.onerror = () => {
      reject(
        new Error('Could not read the file.')
      )
    }
    // File ko Base64 Data URL format mein read karo.
    reader.readAsDataURL(file)

  })

}



const MAX = 1024 * 1024


// File ko bytes ke array mein convert karta hai.

export const fileToBytes = async (file) => {

  // Check karo ki file 1 MB se badi toh nahi hai.
  if (file.size > MAX) {

    throw new Error(
      `Please use a file under ${formatBytes(MAX)}. Hex and binary output gets huge.`
    )

  }
  // File ko ArrayBuffer mein read karo.
  const arrayBuffer = await file.arrayBuffer()
  // ArrayBuffer ko Uint8Array mein convert karo.
  // Isse file ke individual bytes access kar sakte hain.

  return new Uint8Array(arrayBuffer)

}


// =====================================================
// 12. CONVERT BYTES TO HEXADECIMAL
// =====================================================

// Har byte ko hexadecimal representation mein convert karta hai.

export const toHex = (bytes) => {

  // Bytes array par loop lagao.
  const hexValues = [...bytes].map((byte) => {

    // Byte ko base 16 mein convert karo.
    const hex = byte.toString(16)

    // Agar ek digit hai toh starting mein 0 add karo.
    return hex.padStart(2, '0')

  })
  // Saare hexadecimal values ko space se join karo.
  return hexValues.join(' ')

}


// =====================================================
// 13. CONVERT BYTES TO BINARY
// =====================================================

// Har byte ko binary representation mein convert karta hai.

export const toBinary = (bytes) => {

  // Bytes array par loop lagao.
  const binaryValues = [...bytes].map((byte) => {

    // Byte ko base 2 mein convert karo.
    const binary = byte.toString(2)

    // Har byte ko exactly 8 bits mein represent karo.
    return binary.padStart(8, '0')

  })


  // Saare binary values ko space se join karo.
  return binaryValues.join(' ')

}


