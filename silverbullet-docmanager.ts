
import { space } from "@silverbulletmd/silverbullet/syscalls";
import { datastore } from "@silverbulletmd/silverbullet/syscalls";
import { editor } from "@silverbulletmd/silverbullet/syscalls";
import { codeWidget } from "@silverbulletmd/silverbullet/syscalls";

export async function render(exclusionRegex?: string): Promise<string> {
  let docs = await loadDocuments(exclusionRegex);

  //docs.sort((a, b) => b.size - a.size);
  docs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  let html = `<div class="docmanager">
   <table><thead><tr><td>Name</td><td style="text-align: right;">Size</td><td>Used In</td></tr></thead>`;

  html += "<tbody>"

  let totalSize = 0;

  docs.forEach((d) => {
    html += `<tr>
      <td><a href="/${d.name}" class="wiki-link" target="_blank">${d.name}</a></td>
      <td style="text-align: right;">${prettifySize(d.size)}</td>`;

    if (d.links.length > 0) {
      html += `<td>${d.links.map(l => `<a onclick="return false;" href="/${l.page}@${l.pos}" class="wiki-link" data-item="p|${l.page}@${l.pos}">${l.page}@${l.pos}</a>`).join(" &bull; ")}</td>`;
    }
    else {
      html += `<td><i>Unused</i> &rarr; <button class="delete-button sb-button-primary" data-item="d|${d.name}">Delete</button></td>`
    }

    html += '</tr>';

    totalSize += d.size;
  });

  html += "</tbody>"

  html += `<tfoot><tr><td>${docs.length} documents</td><td style='text-align: right;'>${prettifySize(totalSize)}</td><td></td></tr></tfoot>`

  html += "</table></div>"

  return html;
}

export async function click(dataItem: string) {
  if (dataItem.startsWith("d|")) {
    let confirmed = await editor.confirm("Are you sure you want to delete that document?");
    if (confirmed) {
      await space.deleteDocument(dataItem.substring(2));
      editor.flashNotification("Document deleted.");
      codeWidget.refreshAll();
    }
  }
  else if (dataItem.startsWith("p|")) {
    let parts = dataItem.substring(2).split("@");
    editor.navigate({ kind: "page", page: parts[0], pos: parts[1] });
  }
  else {
    console.log("Invalid click argument: " + dataItem);
  }
}

function prettifySize(size: number) {
  if (size < 1024) {
    return size + " B";
  }
  else if (size < 1048576) {
    return roundToDecimals(size / 1024, 1) + " KB";
  }
  else {
    return roundToDecimals(size / 1048576, 1) + " MB";
  }
}

function roundToDecimals(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}


async function loadDocuments(exclusionRegex?: string) {
  let links = await datastore.queryLua(["idx", "link"], {});
  let docs = await space.listDocuments();

  let hasRegex: boolean = false;
  let rExp: any = null;
  if (typeof exclusionRegex === "string" && exclusionRegex.length > 0) {
    rExp = new RegExp(exclusionRegex);
    hasRegex = true;
  }

  let output: Document[] = [];

  for (const d of docs) {
    if (!hasRegex || (hasRegex && !rExp.test(d.name))) {

      let newLinks = findDocLinks(links, d.name);
      let newDoc = new Document(d.name, d.size, newLinks);
      output.push(newDoc);
    }
  }

  return output;
}

// Not async because all local
function findDocLinks(links: any, attn: string) {
  let output: DocumentLink[] = []

  Array.prototype.forEach.call(links, function (l): void {
    if (l.toFile === attn) {
      output.push(new DocumentLink(l.page, l.pos));
    }
  });

  return output;
}

class DocumentLink {
  page: string;
  pos: number;

  constructor(page: string, pos: number) {
    this.page = page;
    this.pos = pos;
  }
}

class Document {
  name: string;
  size: number;
  links: DocumentLink[];

  constructor(name: string, size: number, links: DocumentLink[]) {
    this.name = name;
    this.size = size;
    this.links = links;
  }
}
