enum TagType {
  Open,
  Close,
}

interface Tag {
  type: TagType;
  name: string;
}

export class TreeParser {
  tags: string[];

  constructor() {
    this.tags = [];
  }

  isRoot(line: string): boolean {
    const tag = findTag(line);

    if (tag !== undefined) {
      if (tag.type === TagType.Close) {
        this.tags.push(tag.name);
      } else if (tag.type === TagType.Open) {
        if (this.tags.length === 0) {
          return true;
        }

        if (this.tags[this.tags.length - 1] === tag.name) {
          this.tags.pop();
        }
      }
    }

    return false;
  }
}

function findTag(line: string): Tag | undefined {
  // https://stackoverflow.com/a/1732454/141214
  const matchOpenClose = line.match(/<(\w+) .*>.*<\/(\w+)>/);
  const matchSelfClosing = line.match(/<\w+ .*\/>$/);
  const matchClose = line.match(/<\/(\w+)>$/);
  const matchOpen = line.match(/<(\w+) .*>[[\w-_]*]?$/);

  if (matchSelfClosing !== null || matchOpenClose !== null) {
    return;
  } else if (matchClose !== null) {
    return {
      type: TagType.Close,
      name: matchClose[1],
    };
  } else if (matchOpen !== null) {
    return {
      type: TagType.Open,
      name: matchOpen[1],
    };
  }
}
