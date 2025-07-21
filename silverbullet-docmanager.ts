
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
      html += `<td>${d.links.map(l => `<a onclick="return false;" href="/${l.page}@${l.pos}" class="wiki-link" data-page="${l.page}@${l.pos}">${l.page}@${l.pos}</a>`).join(" &bull; ")}</td>`;
    }
    else {
      html += `<td><i>Unused</i> &rarr; <button class="delete-button sb-button-primary" data-name="${d.name}">Delete</button></td>`
    }

    html += '</tr>';

    totalSize += d.size;
  });

  html += "</tbody>"

  html += `<tfoot><tr><td>${docs.length} documents</td><td style='text-align: right;'>${prettifySize(totalSize)}</td><td></td></tr></tfoot>`

  html += "</table></div>"

  return html;
}

export async function click(dataName: string, dataPage: string) {
  if (typeof dataName == "string" && dataName !== "") {
    let confirmed = await editor.confirm("Are you sure you want to delete that document?");
    if (confirmed) {
      await space.deleteDocument(dataName);
      editor.flashNotification("Document deleted.");
      codeWidget.refreshAll();
    }
  }
  else if (typeof dataPage == "string" && dataPage !== "") {
    let parts = dataPage.split("@");
    editor.navigate({ kind: "page", page: parts[0], pos: parts[1] });
  }
  else {
    console.log("No valid click arguments.")
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

  let rExp: any = null;
  if (typeof exclusionRegex === "string") {
    rExp = new RegExp(exclusionRegex + "", "g");
  }

  let output: Document[] = [];

  await Array.prototype.forEach.call(docs, async function (d): Promise<void> {
    // This regex check seems unreliable, don't know why
    if (rExp == null || (rExp != null && !rExp.test(d.name))) {
      //console.log("Valid: " + d.name + " with " + rExp);

      let newLinks = findDocLinks(links, d.name);
      let newDoc = new Document(d.name, d.size, newLinks);
      output.push(newDoc);
    }
    //else {
    //  console.log("NOT Valid: " + d.name + " with " + rExp);
    //}
  });

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
