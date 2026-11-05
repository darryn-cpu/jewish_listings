import { createHash } from "node:crypto"
import zlib from "node:zlib"
import { writeFileSync } from "node:fs"

function crc32(buffer) {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const name = Buffer.from(type)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, checksum])
}

function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const offset = row + 1 + x * 4
      const cx = x - size / 2
      const cy = y - size / 2
      const inside = cx * cx + cy * cy < (size * 0.42) ** 2
      const ink = inside ? [20, 21, 42] : [247, 244, 236]
      const bar = inside && Math.abs(cx) < size * 0.08 && cy > -size * 0.16 && cy < size * 0.22
      const arm = inside && cy < -size * 0.02 && cy > -size * 0.16 && cx > -size * 0.16 && cx < size * 0.18
      const gold = bar || arm
      const pixel = gold ? [255, 189, 31] : ink
      raw[offset] = pixel[0]
      raw[offset + 1] = pixel[1]
      raw[offset + 2] = pixel[2]
      raw[offset + 3] = 255
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

writeFileSync(new URL("../public/icon-192.png", import.meta.url), png(192))
writeFileSync(new URL("../public/icon-512.png", import.meta.url), png(512))
console.log(createHash("sha256").update(png(16)).digest("hex"))
