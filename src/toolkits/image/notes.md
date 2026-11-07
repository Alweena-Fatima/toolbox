# Image Toolkit: Simple Notes

Focus: how an image is **loaded, resized, compressed, converted, turned into a URL, and turned into hex/binary**.

---

## The Big Picture

```
User picks a file (File)
        |
        v
  loadImage()  ------------------>  Image object (pixels in memory)
        |
        v
  Draw on Canvas  (resize here)
        |
        v
  canvas.toBlob(type, quality)  ->  new Blob (compressed / converted image)
        |
        +--> download()          -> save as a file
        +--> createObjectURL()   -> temporary URL (preview)

Separate path (reading raw data of the file):
File -> fileToDataURL() -> Base64 text URL
File -> fileToBytes()   -> Uint8Array -> toHex() / toBinary()
```

**Key idea:** the browser can't "edit" a file directly. So we draw the image onto a **canvas**, then export the canvas again as a **new file (Blob)**. Resize, compress and convert are all done in that export step.

---

## 1. Basic Terms

| Term | Meaning |
|------|---------|
| **File** | A file the user selected. Has `.name`, `.size`, `.type`. |
| **Blob** | Raw binary data in memory (an image, for example). A File is a kind of Blob. |
| **MIME type** | Format label, like `image/png`, `image/jpeg`, `image/webp`. |
| **Pixel** | One dot of the image. Width x height = total pixels. |
| **Byte** | 8 bits, a number from 0 to 255. Files are made of bytes. |

The `EXT` object maps MIME type to extension:

```js
EXT['image/jpeg']  // 'jpg'
```

---

## 2. File Size (`formatBytes`)

- 1 KB = 1024 bytes
- 1 MB = 1024 x 1024 = 1,048,576 bytes

```js
formatBytes(1536)      // '1.5 KB'
formatBytes(2097152)   // '2.00 MB'
```

`toFixed(1)` keeps 1 digit after the decimal point.

---

## 3. Loading an Image (`loadImage`)

An image needs time to load, so the function returns a **Promise**.

Steps:
1. `URL.createObjectURL(file)` makes a temporary URL for the file.
2. `new Image()` creates an image object in memory.
3. `image.src = url` tells the browser to load it.
4. `onload` fires on success: revoke the URL, then `resolve(image)`.
5. `onerror` fires if the file isn't a valid image: revoke the URL, then `reject(error)`.

Useful after loading:
- `image.naturalWidth` is the original width in pixels.
- `image.naturalHeight` is the original height in pixels.

---

## 4. URLs for Images: Two Kinds

### A) Object URL (temporary, fast)

```js
const url = URL.createObjectURL(file)   // blob:http://localhost/abcd-1234
URL.revokeObjectURL(url)                // release memory when done
```

- Points to the file already in memory. Nothing is uploaded.
- Great for preview (`<img src={url}>`) and downloads.
- Works only in the current browser tab and only while not revoked.
- Always revoke it, or memory leaks.

### B) Data URL / Base64 (the image written as text)

```js
fileToDataURL(file)  // 'data:image/png;base64,iVBORw0KGgo...'
```

Parts: `data:` + MIME type + `;base64,` + encoded data.

- **Base64** turns binary into plain text characters.
- It can be saved in a database, JSON, HTML or CSS, since it is just text.
- It is about **33% bigger** than the original file.
- It is **not** encryption. Anyone can decode it.
- Done with `FileReader.readAsDataURL(file)` (async, uses `onload` / `onerror`).

| | Object URL | Data URL |
|---|-----------|----------|
| Looks like | `blob:http://...` | `data:image/png;base64,...` |
| Stored as | pointer to memory | the actual data as text |
| Size | tiny | large |
| Lasts | until revoked / tab closes | forever (it is the data) |

---

## 5. Canvas: Where the Magic Happens (`renderImage`)

```js
const canvas = document.createElement('canvas')
canvas.width = finalWidth
canvas.height = finalHeight

const context = canvas.getContext('2d')
context.drawImage(image, 0, 0, finalWidth, finalHeight)

canvas.toBlob(callback, type, quality)
```

- `drawImage(image, x, y, w, h)` draws the image and **scales it to w x h**.
- `toBlob(callback, type, quality)` exports the canvas as a new file:
  - `type` is the output format (JPEG, PNG, WebP).
  - `quality` is 0 to 1 (JPEG/WebP only).
- `Math.round()` is used because pixel sizes must be whole numbers.

### JPEG needs a white background

JPEG has **no transparency**. Transparent areas would turn black, so we paint white first:

```js
context.fillStyle = '#fff'
context.fillRect(0, 0, width, height)
```

### Safety check

If the browser can't export a format, it silently gives PNG. So we check `blob.type !== type` and throw an error.

---

## 6. How Image Compression Works

Compression = making the file use fewer bytes.

### Lossy vs Lossless

| | Lossy | Lossless |
|---|-------|----------|
| Detail | Some is thrown away | Nothing is lost |
| Size | Much smaller | Less saving |
| Formats | JPEG, WebP | PNG |
| Best for | Photos | Logos, screenshots, transparency |

### 3 ways the toolkit can reduce size

1. **Lower quality** (`compressImage`)
   - `quality: 0.8` = 80%, `0.5` = 50%.
   - Lower quality gives a smaller file but a blurrier image.
   - Works only for JPEG/WebP. For PNG, `quality` is ignored.
2. **Reduce width/height** (`resizeImage`)
   - Fewer pixels means a smaller file. Half width and half height is about 1/4 of the pixels.
3. **Change format** (`convertImage`)
   - PNG to JPEG or WebP is usually much smaller for photos.
   - WebP is usually smaller than JPEG at the same look.

Quality 50% does **not** mean the file becomes exactly 50% smaller.

```js
const { blob } = await compressImage(file, { quality: 0.6, type: 'image/jpeg' })
console.log(formatBytes(file.size), '->', formatBytes(blob.size))
download(blob, 'compressed.jpg')
```

---

## 7. Format Conversion (`convertImage`)

Load, draw on canvas, then export with a different `type`.

```js
convertImage(file, 'image/webp')   // quality 0.92
```

Possible: PNG <-> JPEG <-> WebP.

Watch out: PNG with transparency to JPEG gives a white background.

---

## 8. Resize and Aspect Ratio (`resizeImage`)

**Aspect ratio** is the shape of the image. The code stores `height / width`.

Example: original 1200 x 800, ratio = 800 / 1200 = 0.6667

If the user enters width = 600 and "keep ratio" is ON:

```
height = width x ratio = 600 x 0.6667 = 400    ->  600 x 400
```

If the user enters only height:

```
width = height / ratio
```

If keep ratio is OFF and both are given, the image gets **stretched**.

Small helpers:
- `Number(options.width) || 0` converts input text to a number (empty becomes 0).
- `if (!width && !height)` throws an error if both are empty.
- Output format: keep the original if supported, else PNG:
  ```js
  const type = EXT[file.type] ? file.type : 'image/png'
  ```

---

## 9. Image as Raw Bytes (`fileToBytes`)

An image file is really just a long list of bytes.

```js
const arrayBuffer = await file.arrayBuffer()   // raw binary memory
const bytes = new Uint8Array(arrayBuffer)      // one byte per element, 0 to 255
```

- **ArrayBuffer**: raw memory block (can't be read byte by byte directly).
- **Uint8Array**: a view of it where each element is one byte.
- Limit: **1 MB** (`MAX = 1024 * 1024`). Hex/binary text is huge: hex is about 3 characters per byte, binary about 9 characters per byte.

---

## 10. Image to Hex (`toHex`)

**Hex** = base 16 (digits `0-9` and `a-f`). One byte (0-255) = exactly 2 hex digits.

| Decimal | Hex |
|---------|-----|
| 0 | `00` |
| 10 | `0a` |
| 16 | `10` |
| 255 | `ff` |

```js
byte.toString(16).padStart(2, '0')   // 10 -> 'a' -> '0a'
```

- `toString(16)` converts the number to hex text.
- `padStart(2, '0')` adds a leading zero so every byte is 2 characters wide.
- `[...bytes]` (spread) turns the Uint8Array into a normal array so `.map()` works.
- `.join(' ')` puts spaces between bytes.

Example output: `89 50 4e 47 0d 0a 1a 0a ...`

---

## 11. Image to Binary (`toBinary`)

**Binary** = base 2 (only 0 and 1). One byte = exactly 8 bits.

| Decimal | Binary |
|---------|--------|
| 0 | `00000000` |
| 5 | `00000101` |
| 255 | `11111111` |

```js
byte.toString(2).padStart(8, '0')   // 5 -> '101' -> '00000101'
```

Example output: `10001001 01010000 01001110 01000111 ...`

---

## 12. Magic Numbers (try it!)

The first bytes of a file reveal its real format:

| Format | First bytes (hex) |
|--------|-------------------|
| PNG | `89 50 4e 47` (`50 4e 47` is "PNG" in ASCII) |
| JPEG | `ff d8 ff` |
| WebP | `52 49 46 46 ... 57 45 42 50` ("RIFF ... WEBP") |

Run `toHex` on an image and you can see these at the start.

---

## 13. Async Basics Used Everywhere

- **Promise**: a value that will arrive later. It can be pending, fulfilled (`resolve`) or rejected (`reject`).
- **async/await**: `await` waits for a Promise inside an `async` function, without freezing the page.
- **Callbacks / events**: `onload`, `onerror` run when the browser finishes the job.
- **try/catch**: handle errors thrown with `throw new Error('...')`.

```js
try {
  const result = await resizeImage(file, { width: 600, keepRatio: true })
} catch (error) {
  console.error(error.message)
}
```

---

## 14. Download (`download`)

```js
const link = document.createElement('a')   // invisible link
link.href = URL.createObjectURL(blob)      // points to the blob
link.download = fileName                   // name to save as
link.click()                               // start download
setTimeout(() => URL.revokeObjectURL(link.href), 1000)  // cleanup
```

The 1-second delay gives the browser time to start the download before the URL is revoked.

---

## 15. Function Cheat Sheet

| Function | Input | Output | Use |
|----------|-------|--------|-----|
| `formatBytes` | number | `'1.5 KB'` | readable size |
| `loadImage` | File | `Image` | read pixels |
| `renderImage` | File + options | `{blob, width, height}` | core engine |
| `compressImage` | File + quality | Blob | smaller file |
| `convertImage` | File + type | Blob | change format |
| `resizeImage` | File + width/height | Blob | change dimensions |
| `download` | Blob + name | file saved | save to disk |
| `fileToDataURL` | File | Base64 text URL | embed / store |
| `fileToBytes` | File | `Uint8Array` | raw bytes |
| `toHex` | bytes | hex text | see data in hex |
| `toBinary` | bytes | binary text | see data in bits |

---

## 16. One-Line Summary

> Load the image, draw it on a canvas at the size you want, export it with `toBlob(type, quality)` to compress or convert it, and use object URLs, Base64, hex or binary depending on how you want to **view, store or inspect** it.