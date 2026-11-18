import { useEffect, useState } from 'react';
import SpeakButton from '@/components/SpeakButton';
import WordImage from '@/components/WordImage';
import { choiceClass, type QuestionProps } from '@/components/games/questions/questionShared';
import { toWordResult, type WordResult } from '@/lib/games/types';
import type { Word } from '@/lib/vocabulary';

const AUTO_ADVANCE_MS = 1200;

interface ReadChoiceQuestionProps extends QuestionProps {
  word: Word;
  options: Word[];
}

export default function ReadChoiceQuestion({ word, options, onDone }: ReadChoiceQuestionProps) {
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const hadWrongAttempt = wrongIds.length > 0;
  const results: WordResult[] = [toWordResult(word, !hadWrongAttempt)];

  useEffect(() => {
    if (!isSolved) return;
    const timer = window.setTimeout(() => onDone(results), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [isSolved, onDone, results]);

  const choose = (option: Word) => {
    if (isSolved || wrongIds.includes(option.id)) return;
    if (option.id === word.id) {
      setIsSolved(true);
    } else {
      setWrongIds((previous) => [...previous, option.id]);
    }
  };

  if (isSolved) {
    return (
      <section className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 shadow-sm">
          <WordImage src={word.image_url} alt={word.finnish} fit="cover" className="aspect-square w-full" />
        </div>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl font-bold text-slate-900">{word.finnish}</p>
          <SpeakButton text={word.finnish} language="fi" label="Fince telaffuz" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm">
        <p className="text-2xl font-bold text-slate-900">{word.finnish}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => choose(option)}
            disabled={isSolved || wrongIds.includes(option.id)}
            className={`${choiceClass(isSolved, option.id === word.id, wrongIds.includes(option.id))} overflow-hidden`}
          >
            <WordImage src={option.image_url} alt="" fit="cover" className="aspect-square w-full" />
          </button>
        ))}
      </div>
    </section>
  );
}
