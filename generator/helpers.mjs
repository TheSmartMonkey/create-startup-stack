export function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export function toKebabCase(str) {
  return str.replace(/ /g, '-').replace(/[A-Z]/g, m => "-" + m.toLowerCase());
}
