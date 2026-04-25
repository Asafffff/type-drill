import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RotateCcw } from 'lucide-react';
import { WORD_BANKS } from './wordBanks';
import './styles.css';

const WORD_COUNTS = [10, 25, 50, 100];
const PRACTICE_MODES = ['standard', 'hard'];
const CARET_HEIGHT_SCALE = 0.80;

function pickRandom(source) {
  return source[Math.floor(Math.random() * source.length)];
}

function shuffleWords(language, count, mode) {
  const bank = WORD_BANKS[language];
  return Array.from({ length: count }, () => {
    if (mode === 'hard') return pickRandom(bank.hard);
    return Math.random() < 0.28 ? pickRandom(bank.hard) : pickRandom(bank.common);
  });
}

function App() {
  const [language, setLanguage] = useState('english');
  const [practiceMode, setPracticeMode] = useState('standard');
  const [wordCount, setWordCount] = useState(25);
  const [words, setWords] = useState(() => shuffleWords('english', 25, 'standard'));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedWords, setTypedWords] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [typedKeyCount, setTypedKeyCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [caretStyle, setCaretStyle] = useState(null);
  const [isCaretIdle, setIsCaretIdle] = useState(true);
  const inputRef = useRef(null);
  const typingPanelRef = useRef(null);
  const caretTargetRef = useRef(null);
  const caretIdleTimerRef = useRef(null);

  const isHebrew = language === 'hebrew';
  const isComplete = currentWordIndex >= words.length;
  const isFocusMode = Boolean(startTime && !isComplete);

  const resetTest = useCallback((nextLanguage = language, nextWordCount = wordCount, nextMode = practiceMode) => {
    setWords(shuffleWords(nextLanguage, nextWordCount, nextMode));
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTypedWords([]);
    setStartTime(null);
    setEndTime(null);
    setTypedKeyCount(0);
    setBackspaceCount(0);
    setIsCaretIdle(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [language, wordCount, practiceMode]);

  const stats = useMemo(() => {
    const completed = typedWords.length;
    const targetWords = words.slice(0, completed);
    const correctChars = typedWords.reduce((sum, typed, index) => {
      const target = targetWords[index] ?? '';
      return sum + typed.split('').filter((char, charIndex) => char === target[charIndex]).length;
    }, 0);
    const typedChars = typedWords.reduce((sum, typed) => sum + typed.length, 0);
    const missingChars = targetWords.reduce((sum, target, index) => {
      return sum + Math.max(target.length - (typedWords[index]?.length ?? 0), 0);
    }, 0);
    const totalAttempts = typedChars + missingChars;
    const mistakes = Math.max(totalAttempts - correctChars, 0);
    const elapsedMs = startTime ? ((endTime ?? Date.now()) - startTime) : 0;
    const minutes = elapsedMs / 60000;
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctChars / totalAttempts) * 100) : 100;
    const correctionRate = typedKeyCount > 0 ? backspaceCount / typedKeyCount : 0;
    const consistency = Math.max(0, Math.round((1 - Math.min(correctionRate, 1)) * 100));
    const elapsedSeconds = Math.round(elapsedMs / 1000);

    return { wpm, accuracy, mistakes, completed, elapsedSeconds, consistency, correctionRate };
  }, [typedWords, words, startTime, endTime, typedKeyCount, backspaceCount]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(caretIdleTimerRef.current);
  }, []);

  useLayoutEffect(() => {
    if (!typingPanelRef.current || !caretTargetRef.current || isComplete) {
      setCaretStyle(null);
      return;
    }

    const panelRect = typingPanelRef.current.getBoundingClientRect();
    const targetRect = caretTargetRef.current.getBoundingClientRect();
    const caretHeight = Math.max(targetRect.height * CARET_HEIGHT_SCALE, 21);
    const caretTop = targetRect.top - panelRect.top + Math.max((targetRect.height - caretHeight) / 2, 0);

    setCaretStyle({
      transform: `translate3d(${targetRect.left - panelRect.left}px, ${caretTop}px, 0)`,
      height: `${caretHeight}px`
    });
  }, [currentInput, currentWordIndex, words, typedWords, isComplete, language]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        resetTest();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resetTest]);

  const commitWord = useCallback((typedWord = currentInput) => {
    const nextTypedWords = [...typedWords, typedWord];
    const nextIndex = currentWordIndex + 1;

    setTypedWords(nextTypedWords);
    setCurrentInput('');
    setCurrentWordIndex(nextIndex);

    if (nextIndex === words.length) {
      setEndTime(Date.now());
    }
  }, [currentInput, currentWordIndex, typedWords, words.length]);

  const pinInputCursorToEnd = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const end = input.value.length;
    input.setSelectionRange(end, end);
  }, []);

  const scheduleInputCursorPin = useCallback(() => {
    window.requestAnimationFrame(pinInputCursorToEnd);
  }, [pinInputCursorToEnd]);

  useLayoutEffect(() => {
    pinInputCursorToEnd();
  }, [currentInput, pinInputCursorToEnd]);

  const handleKeyDown = (event) => {
    const isTypingKey = event.key.length === 1 || event.key === 'Backspace' || event.key === ' ';
    const isNavigationKey = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown'
    ].includes(event.key);
    const isSelectAll = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a';

    if (isNavigationKey || isSelectAll) {
      event.preventDefault();
      scheduleInputCursorPin();
      return;
    }

    if (isTypingKey) {
      setIsCaretIdle(false);
      window.clearTimeout(caretIdleTimerRef.current);
      caretIdleTimerRef.current = window.setTimeout(() => setIsCaretIdle(true), 650);
    }

    if (isComplete) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        resetTest();
      }
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      if (currentInput.length > 0) {
        if (!startTime) setStartTime(Date.now());
        commitWord();
      }
    }

    if (event.key === 'Backspace' && currentInput.length === 0 && currentWordIndex > 0) {
      event.preventDefault();
      setBackspaceCount((count) => count + 1);
      const previousTypedWords = typedWords.slice(0, -1);
      const previousInput = typedWords[typedWords.length - 1] ?? '';

      setTypedWords(previousTypedWords);
      setCurrentWordIndex(currentWordIndex - 1);
      setCurrentInput(previousInput);
    }

    if (event.key === 'Backspace' && currentInput.length > 0) {
      setBackspaceCount((count) => count + 1);
    }
  };

  const handleInput = (event) => {
    if (isComplete) {
      event.target.value = '';
      return;
    }

    const value = event.target.value.replace(/\s/g, '');
    const isTailEdit = value.startsWith(currentInput) || currentInput.startsWith(value);

    if (!isTailEdit) {
      event.target.value = currentInput;
      scheduleInputCursorPin();
      return;
    }

    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }

    if (value.length > currentInput.length) {
      setTypedKeyCount((count) => count + value.length - currentInput.length);
    }

    if (currentWordIndex === words.length - 1 && value === words[currentWordIndex]) {
      commitWord(value);
      event.target.value = '';
      return;
    }

    setCurrentInput(value);
  };

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    resetTest(nextLanguage, wordCount, practiceMode);
  };

  const changePracticeMode = (nextMode) => {
    setPracticeMode(nextMode);
    resetTest(language, wordCount, nextMode);
  };

  const changeWordCount = (nextWordCount) => {
    setWordCount(nextWordCount);
    resetTest(language, nextWordCount, practiceMode);
  };

  return (
    <main className={`app ${isFocusMode ? 'focusMode' : ''}`} onClick={() => inputRef.current?.focus()}>
      <section className="topbar" aria-label="Typing settings">
        <div className="brand">type drill</div>
        <div className="controls">
          <div className="segmented" aria-label="Language">
            <button className={language === 'english' ? 'active' : ''} onClick={() => changeLanguage('english')}>EN</button>
            <button className={language === 'hebrew' ? 'active' : ''} onClick={() => changeLanguage('hebrew')}>HE</button>
          </div>
          <div className="segmented textSegment" aria-label="Practice mode">
            {PRACTICE_MODES.map((mode) => (
              <button key={mode} className={practiceMode === mode ? 'active' : ''} onClick={() => changePracticeMode(mode)}>
                {mode}
              </button>
            ))}
          </div>
          <div className="segmented" aria-label="Word count">
            {WORD_COUNTS.map((count) => (
              <button key={count} className={wordCount === count ? 'active' : ''} onClick={() => changeWordCount(count)}>
                {count}
              </button>
            ))}
          </div>
          <button className="iconButton" onClick={() => resetTest()} aria-label="Restart" title="Restart">
            <RotateCcw size={20} strokeWidth={2.2} />
          </button>
        </div>
      </section>

      <section className="stats" aria-label="Live stats">
        <div><span>{stats.wpm}</span>wpm</div>
        <div><span>{stats.accuracy}</span>acc</div>
        <div><span>{stats.completed}/{words.length}</span>words</div>
      </section>

      <section ref={typingPanelRef} className={`typingPanel ${isHebrew ? 'rtl' : 'ltr'}`} dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="wordStream" aria-label="Words to type">
          {words.map((word, wordIndex) => {
            const typed = wordIndex < currentWordIndex ? typedWords[wordIndex] : wordIndex === currentWordIndex ? currentInput : '';
            const isActive = wordIndex === currentWordIndex;
            const isDone = wordIndex < currentWordIndex;

            return (
              <span key={`${word}-${wordIndex}`} className={`word ${isActive ? 'current' : ''} ${isDone ? 'done' : ''}`}>
                {word.split('').map((char, charIndex) => {
                  const typedChar = typed[charIndex];
                  let state = '';
                  if (typedChar != null) state = typedChar === char ? 'correct' : 'wrong';

                  return (
                    <React.Fragment key={`${char}-${charIndex}`}>
                      {isActive && charIndex === currentInput.length && <span ref={caretTargetRef} className="caretTarget" />}
                      <span className={state}>{char}</span>
                    </React.Fragment>
                  );
                })}
                {typed.length > word.length && (
                  <span className="overflow">
                    {typed.slice(word.length).split('').map((char, index) => <span key={`${char}-${index}`}>{char}</span>)}
                  </span>
                )}
                {isActive && currentInput.length >= word.length && <span ref={caretTargetRef} className="caretTarget" />}
              </span>
            );
          })}
        </div>
        {caretStyle && <div className={`smoothCaret ${isCaretIdle ? 'idle' : 'active'}`} style={caretStyle} />}

        <input
          ref={inputRef}
          className="hiddenInput"
          value={currentInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={scheduleInputCursorPin}
          onMouseUp={scheduleInputCursorPin}
          onSelect={scheduleInputCursorPin}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          dir={isHebrew ? 'rtl' : 'ltr'}
          aria-label="Typing input"
        />
      </section>

      {isComplete && (
        <section className="results" aria-label="Results">
          <div><span>{stats.wpm}</span>wpm</div>
          <div><span>{stats.accuracy}%</span>accuracy</div>
          <div><span>{stats.elapsedSeconds}s</span>time</div>
          <div><span>{stats.consistency}%</span>consistency</div>
          <div><span>{Math.round(stats.correctionRate * 100)}%</span>correction ratio</div>
          <div><span>{stats.mistakes}</span>mistakes</div>
          <div><span>{backspaceCount}</span>corrections</div>
          <button onClick={() => resetTest()}>restart</button>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
