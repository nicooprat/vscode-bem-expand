export function findClass(text: string): string | undefined {
  const match = text.match(/class="([^"]+)"|class='([^']+)|className="([^"]+)"|className='([^']+)'/);

  if (match !== null) {
    return match.slice(1)!.find(m => m !== undefined)!.split(' ')[0];
  }

  return undefined;
}
