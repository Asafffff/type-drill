import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronsRight, RotateCcw } from 'lucide-react';
import { WORD_BANKS } from './wordBanks';
import './styles.css';

const WORD_COUNTS = [10, 25, 50, 100];
const PRACTICE_MODES = ['standard', 'hard'];
const CARET_HEIGHT_SCALE = 0.94;
const CHART_WIDTH = 880;
const CHART_HEIGHT = 210;
const CHART_PADDING = { top: 18, right: 34, bottom: 34, left: 40 };

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

function analyzeWord(typedWord, targetWord) {
  const correct = typedWord.split('').filter((char, index) => char === targetWord[index]).length;
  const incorrect = typedWord.split('').filter((char, index) => targetWord[index] != null && char !== targetWord[index]).length;
  const extra = Math.max(typedWord.length - targetWord.length, 0);
  const missed = Math.max(targetWord.length - typedWord.length, 0);

  return { correct, incorrect, extra, missed };
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function pointsToPath(points) {
  if (points.length === 0) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function ResultChart({ events, maxWpm }) {
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const yMax = Math.max(20, Math.ceil(maxWpm / 20) * 20);
  const xMax = Math.max(events.length - 1, 1);
  const yTicks = [0, Math.round(yMax / 2), yMax];

  const getX = (index) => CHART_PADDING.left + (index / xMax) * plotWidth;
  const getY = (value) => CHART_PADDING.top + plotHeight - (Math.min(value, yMax) / yMax) * plotHeight;
  const wpmPoints = events.map((event, index) => ({ x: getX(index), y: getY(event.wpm) }));
  const rawPoints = events.map((event, index) => ({ x: getX(index), y: getY(event.rawWpm) }));

  return (
    <svg className="resultChart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="WPM chart">
      <g className="chartGrid">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={CHART_PADDING.left} x2={CHART_WIDTH - CHART_PADDING.right} y1={getY(tick)} y2={getY(tick)} />
            <text x={CHART_PADDING.left - 10} y={getY(tick) + 4}>{tick}</text>
          </g>
        ))}
        {events.map((event, index) => (
          <line key={event.index} x1={getX(index)} x2={getX(index)} y1={CHART_PADDING.top} y2={CHART_HEIGHT - CHART_PADDING.bottom} />
        ))}
      </g>

      <text className="chartAxisLabel" x="12" y={CHART_HEIGHT / 2} transform={`rotate(-90 12 ${CHART_HEIGHT / 2})`}>words per minute</text>
      <text className="chartAxisLabel" x={CHART_WIDTH - 10} y={CHART_HEIGHT / 2} transform={`rotate(90 ${CHART_WIDTH - 10} ${CHART_HEIGHT / 2})`}>errors</text>

      <path className="chartRawLine" d={pointsToPath(rawPoints)} />
      <path className="chartWpmLine" d={pointsToPath(wpmPoints)} />

      {events.map((event, index) => (
        <g key={`x-${event.index}`}>
          <text className="chartXTick" x={getX(index)} y={CHART_HEIGHT - 9}>{event.index}</text>
          {event.errors > 0 && <text className="chartError" x={getX(index)} y={getY(event.wpm) - 12}>×</text>}
        </g>
      ))}
    </svg>
  );
}

function App() {
  const [language, setLanguage] = useState('english');
  const [practiceMode, setPracticeMode] = useState('standard');
  const [wordCount, setWordCount] = useState(25);
  const [words, setWords] = useState(() => shuffleWords('english', 25, 'standard'));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedWords, setTypedWords] = useState([]);
  const [testEvents, setTestEvents] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [typedKeyCount, setTypedKeyCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [caretStyle, setCaretStyle] = useState(null);
  const [isCaretIdle, setIsCaretIdle] = useState(true);
  const [isUiHidden, setIsUiHidden] = useState(false);
  const inputRef = useRef(null);
  const restartButtonRef = useRef(null);
  const resultsPrimaryActionRef = useRef(null);
  const typingPanelRef = useRef(null);
  const caretTargetRef = useRef(null);
  const caretIdleTimerRef = useRef(null);

  const isHebrew = language === 'hebrew';
  const isComplete = currentWordIndex >= words.length;
  const isFocusMode = Boolean(isUiHidden && !isComplete);

  const resetTest = useCallback((nextLanguage = language, nextWordCount = wordCount, nextMode = practiceMode) => {
    setWords(shuffleWords(nextLanguage, nextWordCount, nextMode));
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTypedWords([]);
    setTestEvents([]);
    setStartTime(null);
    setEndTime(null);
    setTypedKeyCount(0);
    setBackspaceCount(0);
    setIsCaretIdle(true);
    setIsUiHidden(false);
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

  const resultStats = useMemo(() => {
    const completed = testEvents.length;
    const correctChars = testEvents.reduce((sum, event) => sum + event.correct, 0);
    const typedChars = testEvents.reduce((sum, event) => sum + event.typedLength, 0);
    const incorrect = testEvents.reduce((sum, event) => sum + event.incorrect, 0);
    const extra = testEvents.reduce((sum, event) => sum + event.extra, 0);
    const missed = testEvents.reduce((sum, event) => sum + event.missed, 0);
    const errors = incorrect + extra + missed;
    const totalAttempts = typedChars + missed;
    const elapsedMs = startTime ? ((endTime ?? Date.now()) - startTime) : 0;
    const minutes = elapsedMs / 60000;
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const raw = minutes > 0 ? Math.round((typedChars / 5) / minutes) : 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctChars / totalAttempts) * 100) : 100;
    const eventWpms = testEvents.map((event) => event.wpm);
    const averageWpm = eventWpms.reduce((sum, wpmValue) => sum + wpmValue, 0) / Math.max(eventWpms.length, 1);
    const variance = eventWpms.reduce((sum, wpmValue) => sum + Math.abs(wpmValue - averageWpm), 0) / Math.max(eventWpms.length, 1);
    const consistency = averageWpm > 0 ? Math.max(0, Math.round((1 - Math.min(variance / averageWpm, 1)) * 100)) : 100;
    const maxWpm = Math.max(wpm, raw, ...testEvents.flatMap((event) => [event.wpm, event.rawWpm]), 20);
    const elapsedSeconds = Math.round(elapsedMs / 1000);

    return {
      accuracy,
      characters: `${correctChars}/${incorrect}/${extra}/${missed}`,
      completed,
      consistency,
      elapsedSeconds,
      errors,
      maxWpm,
      raw,
      sessionElapsedSeconds,
      wpm
    };
  }, [testEvents, startTime, endTime, sessionElapsedSeconds]);

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
        return;
      }

      if (isComplete && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        resetTest();
        return;
      }

      if (isComplete && event.key === 'Tab') {
        event.preventDefault();
        resultsPrimaryActionRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isComplete, resetTest]);

  const commitWord = useCallback((typedWord = currentInput) => {
    const now = Date.now();
    const testStart = startTime ?? now;
    const targetWord = words[currentWordIndex] ?? '';
    const wordAnalysis = analyzeWord(typedWord, targetWord);
    const nextTypedWords = [...typedWords, typedWord];
    const elapsedMs = Math.max(now - testStart, 1);
    const minutes = elapsedMs / 60000;
    const previousCorrect = testEvents.reduce((sum, event) => sum + event.correct, 0);
    const previousTypedLength = testEvents.reduce((sum, event) => sum + event.typedLength, 0);
    const nextCorrect = previousCorrect + wordAnalysis.correct;
    const nextTypedLength = previousTypedLength + typedWord.length;
    const nextIndex = currentWordIndex + 1;
    const nextEvent = {
      index: nextIndex,
      typedWord,
      targetWord,
      elapsedMs,
      typedLength: typedWord.length,
      correct: wordAnalysis.correct,
      incorrect: wordAnalysis.incorrect,
      extra: wordAnalysis.extra,
      missed: wordAnalysis.missed,
      errors: wordAnalysis.incorrect + wordAnalysis.extra + wordAnalysis.missed,
      wpm: Math.round((nextCorrect / 5) / minutes),
      rawWpm: Math.round((nextTypedLength / 5) / minutes)
    };

    setTypedWords(nextTypedWords);
    setTestEvents((events) => [...events, nextEvent]);
    setCurrentInput('');
    setCurrentWordIndex(nextIndex);

    if (nextIndex === words.length) {
      setEndTime(now);
      setSessionElapsedSeconds((seconds) => seconds + Math.round(elapsedMs / 1000));
      setIsUiHidden(false);
    }
  }, [currentInput, currentWordIndex, startTime, testEvents, typedWords, words]);

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

    if (event.key === 'Tab') {
      event.preventDefault();
      restartButtonRef.current?.focus();
      return;
    }

    if (isNavigationKey || isSelectAll) {
      event.preventDefault();
      scheduleInputCursorPin();
      return;
    }

    if (isTypingKey) {
      setIsUiHidden(true);
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
      setIsUiHidden(true);
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

  const showUi = () => {
    if (isUiHidden) setIsUiHidden(false);
  };

  return (
    <main className={`app ${isFocusMode ? 'focusMode' : ''} ${isComplete ? 'resultsMode' : ''}`} onClick={() => { if (!isComplete) inputRef.current?.focus(); }} onMouseMove={showUi}>
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

      {!isComplete && (
        <section className="stats" aria-label="Live stats">
          <div><span>{stats.wpm}</span>wpm</div>
          <div><span>{stats.accuracy}</span>acc</div>
        </section>
      )}

      {!isComplete && <section ref={typingPanelRef} className={`typingPanel ${isHebrew ? 'rtl' : 'ltr'}`} dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="focusWordCount" aria-label="Word progress">{stats.completed}/{words.length} words</div>
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
                {isActive && currentInput.length >= word.length && (
                  <span className="overflow">
                    {typed.slice(word.length).split('').map((char, index) => <span key={`${char}-${index}`}>{char}</span>)}
                    <span ref={caretTargetRef} className="caretTarget" />
                  </span>
                )}
              </span>
            );
          })}
        </div>
        {caretStyle && <div className={`smoothCaret ${isFocusMode || !isCaretIdle ? 'active' : 'idle'}`} style={caretStyle} />}

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
        <button
          ref={restartButtonRef}
          className="typingRestartButton"
          onClick={() => resetTest()}
          aria-label="Restart test"
          title="Restart test"
        >
          <RotateCcw size={22} strokeWidth={2.2} />
        </button>
      </section>}

      {isComplete && (
        <section className="results" aria-label="Results">
          <div className="resultPrimaryStats">
            <div className="resultMetric large">
              <div className="resultLabel">wpm</div>
              <div className="resultValue">{resultStats.wpm}</div>
            </div>
            <div className="resultMetric large">
              <div className="resultLabel">acc</div>
              <div className="resultValue">{resultStats.accuracy}%</div>
            </div>
            <div className="resultMetric testType">
              <div className="resultLabel">test type</div>
              <div className="resultSmallValue">words {wordCount}<br />{language}</div>
            </div>
          </div>

          <div className="resultGraphPanel">
            <ResultChart events={testEvents} maxWpm={resultStats.maxWpm} />
          </div>

          <div className="resultMoreStats">
            <div className="resultMetric">
              <div className="resultLabel">raw</div>
              <div className="resultValue small">{resultStats.raw}</div>
            </div>
            <div className="resultMetric">
              <div className="resultLabel">characters</div>
              <div className="resultValue small">{resultStats.characters}</div>
            </div>
            <div className="resultMetric">
              <div className="resultLabel">consistency</div>
              <div className="resultValue small">{resultStats.consistency}%</div>
            </div>
            <div className="resultMetric">
              <div className="resultLabel">time</div>
              <div className="resultValue small">{formatTime(resultStats.elapsedSeconds)}</div>
              <div className="resultSubValue">{formatTime(resultStats.sessionElapsedSeconds)} session</div>
            </div>
          </div>

          <div className="resultActions" aria-label="Result actions">
            <button ref={resultsPrimaryActionRef} onClick={() => resetTest()} aria-label="Next test" title="Next test">
              <ChevronsRight size={21} />
            </button>
            <button onClick={() => resetTest()} aria-label="Restart test" title="Restart test">
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="resultLoginHint">Sign in to save your result</div>
          <div className="resultShortcuts">
            <div><kbd>tab &gt; enter</kbd><span>- restart test</span></div>
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
