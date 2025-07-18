
import { space } from "@silverbulletmd/silverbullet/syscalls";
import { datastore } from "@silverbulletmd/silverbullet/syscalls";

export async function renderDocManager(exclusionRegex?: string): Promise<string> {
  let docs = await loadDocuments(exclusionRegex);

  // Sort by size desc
  docs.sort((a, b) => b.size - a.size);

  let html = `<div class="docmanager">
   <table><thead><tr><td>Name</td><td style="text-align: right;">Size</td><td>Used In</td><td>&nbsp;</td></tr></thead>`;

  docs.forEach((d) => {
    // How do I map a string-generated element with a function in javascript that I don't know the name of?
  });

  html += "</table></div>"

  return html;
}

function getTableHead(): HTMLTableSectionElement {
  let thead = new HTMLTableSectionElement();
  let theadRow = new HTMLTableRowElement();

  let td1 = new HTMLTableCellElement();
  td1.innerText = "Name";
  theadRow.appendChild(td1);

  let td2 = new HTMLTableCellElement();
  td2.innerText = "Size";
  td2.setAttribute("style", "text-align: right;");
  theadRow.appendChild(td2);

  let td3 = new HTMLTableCellElement();
  td3.innerText = "Used In";
  theadRow.appendChild(td3);

  let td4 = new HTMLTableCellElement();
  theadRow.appendChild(td4);

  return thead;
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