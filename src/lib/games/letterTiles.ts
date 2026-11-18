import { shuffle } from '@/lib/random';

export interface LetterTile {
  char: string;
  id: number;
}

export function buildLetterTiles(text: string): LetterTile[] {
  const chars = [...text.normalize('NFC')];
  return shuffle(chars.map((char, index) => ({ char, id: index })));
}
