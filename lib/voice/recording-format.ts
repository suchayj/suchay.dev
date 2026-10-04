export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
export const MAX_AUDIO_PARTS = 200;
export const MAX_PART_BYTES = 60_000;
const extensions: Record<string, string> = { "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg" };
export function audioType(value: string) { return value.split(";")[0].trim().toLowerCase(); }
export function audioExtension(value: string) { return extensions[audioType(value)]; }
export function validAudioHeader(type: string, bytes: Uint8Array) {
  if (audioType(type) === "audio/webm") return [0x1a, 0x45, 0xdf, 0xa3].every((value, i) => bytes[i] === value);
  if (audioType(type) === "audio/mp4") return [..."ftyp"].every((value, i) => bytes[i + 4] === value.charCodeAt(0));
  if (audioType(type) === "audio/ogg") return [..."OggS"].every((value, i) => bytes[i] === value.charCodeAt(0));
  return false;
}
