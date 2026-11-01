import { inflateRawSync } from "node:zlib";

const centralDirectorySignature = 0x02014b50;
const endOfCentralDirectorySignature = 0x06054b50;
const localHeaderSignature = 0x04034b50;
const stored = 0;
const deflated = 8;

/**
 * Reads the files of a zip archive, by name, from its central directory.
 * Only the stored and deflated methods, which cover the archives that data deposits use, are read.
 */
export function readZipEntries(archive: Buffer) {
  const entries = new Map<string, Buffer>();
  let offset = findCentralDirectory(archive);
  while (archive.readUInt32LE(offset) === centralDirectorySignature) {
    const method = archive.readUInt16LE(offset + 10);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localOffset = archive.readUInt32LE(offset + 42);
    const name = archive.toString("utf8", offset + 46, offset + 46 + nameLength);
    entries.set(name, readEntryData(archive, localOffset, compressedSize, method));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function findCentralDirectory(archive: Buffer) {
  for (let offset = archive.length - 22; offset >= 0; offset--) {
    if (archive.readUInt32LE(offset) === endOfCentralDirectorySignature) {
      return archive.readUInt32LE(offset + 16);
    }
  }
  throw new Error("The archive has no central directory.");
}

function readEntryData(archive: Buffer, localOffset: number, size: number, method: number) {
  if (archive.readUInt32LE(localOffset) !== localHeaderSignature) {
    throw new Error(`No file header at offset ${localOffset}.`);
  }
  const nameLength = archive.readUInt16LE(localOffset + 26);
  const extraLength = archive.readUInt16LE(localOffset + 28);
  const start = localOffset + 30 + nameLength + extraLength;
  const data = archive.subarray(start, start + size);
  if (method === stored) return data;
  if (method === deflated) return inflateRawSync(data);
  throw new Error(`Compression method ${method} is not supported.`);
}

/** Writes a zip archive holding the given files uncompressed, as test fixtures need. */
export function writeZipEntries(entries: Map<string, Buffer>) {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBytes = Buffer.from(name, "utf8");
    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(localHeaderSignature, 0);
    local.writeUInt16LE(stored, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    nameBytes.copy(local, 30);
    const central = Buffer.alloc(46 + nameBytes.length);
    central.writeUInt32LE(centralDirectorySignature, 0);
    central.writeUInt16LE(stored, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    nameBytes.copy(central, 46);
    locals.push(local, data);
    centrals.push(central);
    offset += local.length + data.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(endOfCentralDirectorySignature, 0);
  end.writeUInt16LE(entries.size, 8);
  end.writeUInt16LE(entries.size, 10);
  end.writeUInt32LE(
    centrals.reduce((sum, central) => sum + central.length, 0),
    12,
  );
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}
