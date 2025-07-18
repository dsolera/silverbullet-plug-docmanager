//import { editor } from "@silverbulletmd/silverbullet/syscalls";
//import { string } from "@silverbulletmd/silverbullet/syscalls";
import { space } from "@silverbulletmd/silverbullet/syscalls";
import { datastore } from "@silverbulletmd/silverbullet/syscalls";

export async function renderDocManager(exclusionRegex?: string) {
  let docs = await loadDocuments(exclusionRegex);

  return "NO OUTPUT YET";
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
      // Filename is valid
      //console.log("Valid: " + d.name + " with " + rExp);

      let newLinks = findDocLinks(links, d.name);
      let newDoc = new Document(d.name, d.size, newLinks);
      //console.log(newDoc);

      output.push(newDoc);
    }
    //else {
    //  console.log("NOT Valid: " + d.name + " with " + rExp);
    //}
  });

  //console.log(output);

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

  //console.log(output);

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