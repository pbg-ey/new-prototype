export function insertIntoSection(md: string, sectionTitle: string, addText: string) {
  const lines = md.split(/\n/);
  const header = `## ${sectionTitle}`;
  const idx = lines.findIndex((l) => l.trim().toLowerCase() === header.toLowerCase());

  if (idx === -1) {
    return md.replace(/\n*$/, "\n\n") + header + "\n\n" + addText + "\n";
  }

  let j = idx + 1;
  while (j < lines.length && !/^##\s+/.test(lines[j])) {
    j++;
  }

  const before = lines.slice(0, j).join("\n");
  const after = lines.slice(j).join("\n");
  const insertion = (before.endsWith("\n") ? "" : "\n") + addText + "\n";
  return before + "\n" + insertion + (after ? after : "");
}
