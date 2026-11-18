import { useEffect, useMemo, useState } from 'react';
import GameFeedback from '@/components/games/GameFeedback';
import WordImage from '@/components/WordImage';
import { useSpeaker } from '@/hooks/useSpeaker';
import { type QuestionProps } from '@/components/games/questions/questionShared';
import { shuffle } from '@/lib/random';
import { toWordResult, type WordResult } from '@/lib/games/types';
import type { Word } from '@/lib/vocabulary';

interface ImageMatchingQuestionProps extends QuestionProps {
  words: Word[];
}

const WRONG_FLASH_MS = 700;

export default function ImageMatchingQuestion({ words, onDone, isSaving }: ImageMatchingQuestionProps) {
  const speak = useSpeaker();
  const imageOrder = useMemo(() => shuffle(words), [words]);
  const wordOrder = useMemo(() => shuffle(words), [words]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<{ imageId: string; wordId: string } | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!wrongPair) return;
    const timer = window.setTimeout(() => {
      setSelectedImageId(null);
      setSelectedWordId(null);
      setWrongPair(null);
    }, WRONG_FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [wrongPair]);

  const evaluate = (imageId: string, wordId: string) => {
    if (imageId === wordId) {
      const word = words.find((item) => item.id === imageId);
      setMatchedIds((previous) => new Set(previous).add(imageId));
      setSelectedImageId(null);
      setSelectedWordId(null);
      if (word) void speak(word.finnish, 'fi');
      return;
    }
    setWrongIds((previous) => new Set(previous).add(imageId));
    setWrongPair({ imageId, wordId });
  };

  const pickImage = (id: string) => {
    if (matchedIds.has(id) || wrongPair) return;
    setSelectedImageId(id);
    if (selectedWordId) evaluate(id, selectedWordId);
  };

  const pickWord = (id: string) => {
    if (matchedIds.has(id) || wrongPair) return;
    setSelectedWordId(id);
    if (selectedImageId) evaluate(selectedImageId, id);
  };

  const isDone = matchedIds.size === words.length;
  const results: WordResult[] = words.map((word) => toWordResult(word, !wrongIds.has(word.id)));
  const allCorrect = wrongIds.size === 0;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="space-y-2">
          {imageOrder.map((word) => (
            <button
              key={`img-${word.id}`}
              type="button"
              onClick={() => pickImage(word.id)}
              disabled={matchedIds.has(word.id)}
              className={`w-full overflow-hidden rounded-xl border-2 transition ${
                matchedIds.has(word.id)
                  ? 'border-emerald-400 opacity-70'
                  : wrongPair?.imageId === word.id
                    ? 'border-rose-500 animate-pulse'
                    : selectedImageId === word.id
                      ? 'border-blue-600 ring-4 ring-blue-100'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              <WordImage src={word.image_url} alt={word.finnish} fit="cover" className="aspect-square w-full" />
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {wordOrder.map((word) => (
            <button
              key={`word-${word.id}`}
              type="button"
              onClick={() => pickWord(word.id)}
              disabled={matchedIds.has(word.id)}
              className={`w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition sm:text-base ${
                matchedIds.has(word.id)
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-70'
                  : wrongPair?.wordId === word.id
                    ? 'border-rose-500 bg-rose-50 text-rose-800 animate-pulse'
                    : selectedWordId === word.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-4 ring-blue-100'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              {word.finnish}
            </button>
          ))}
        </div>
      </div>

      {isDone && (
        <GameFeedback
          correct={allCorrect}
          title={allCorrect ? 'Tüm eşleşmeler doğru!' : 'Tüm eşleşmeler tamamlandı'}
          detail={allCorrect ? undefined : `${results.filter((result) => result.correct).length} / ${words.length} kelimeyi ilk denemede eşleştirdiniz.`}
          isSaving={isSaving}
          onContinue={() => onDone(results)}
        />
      )}
    </section>
  );
}
