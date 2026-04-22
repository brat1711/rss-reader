#!/usr/bin/env node
// Generates PWA icons: cream background with a red RSS signal symbol.
import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

// cream: #faf9f6, red: #b91c1c
const BG = [250, 249, 246];
const FG = [185, 28, 28];

function isRssPixel(x, y, size) {
  // RSS icon origin: bottom-left area
  const ox = size * 0.22;
  const oy = size * 0.78;
  const s = size / 192;

  const dx = x - ox;
  const dy = y - oy; // positive = down

  const dist = Math.sqrt(dx * dx + dy * dy);

  // Quadrant: right (dx>0) and up (-dy>0)
  const inQuadrant = dx >= 0 && dy <= 0;

  // Dot at origin
  if (dist < 20 * s) return true;

  // Inner arc
  if (inQuadrant && dist > 38 * s && dist < 56 * s) return true;

  // Outer arc
  if (inQuadrant && dist > 76 * s && dist < 94 * s) return true;

  return false;
}

function makePng(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(2, 9);  // RGB color type

  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(rowLen * size);

  for (let y = 0; y < size; y++) {
    const o = y * rowLen;
    raw[o] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = isRssPixel(x, y, size) ? FG : BG;
      raw[o + 1 + x * 3] = r;
      raw[o + 1 + x * 3 + 1] = g;
      raw[o + 1 + x * 3 + 2] = b;
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', makePng(192));
writeFileSync('public/icon-512.png', makePng(512));

console.log('Icons generated: cream background with red RSS symbol');
