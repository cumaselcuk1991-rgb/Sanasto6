import type { LetterTile } from '@/lib/games/letterTiles';

interface LetterPickerProps {
  tiles: LetterTile[];
  values: (string | null)[];
  disabled: boolean;
  onPick: (tile: LetterTile) => void;
}

export default function LetterPicker({ tiles, values, disabled, onPick }: LetterPickerProps) {
  const usedCount = values.filter((v) => v !== null).length;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {tiles.map((tile) => {
        const isUsed = tile.id < usedCount;
        return (
          <button
            key={tile.id}
            type="button"
            disabled={disabled || isUsed}
            onClick={() => onPick(tile)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold transition sm:h-12 sm:w-12 sm:text-xl ${
              isUsed
                ? 'cursor-default bg-slate-100 text-slate-300'
                : 'bg-blue-700 text-white shadow-sm hover:bg-blue-800 active:scale-95 disabled:opacity-40'
            }`}
          >
            {tile.char}
          </button>
        );
      })}
    </div>
  );
}
