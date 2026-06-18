import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { QUESTION_PREVIEW_SECONDS, QUESTION_ANSWER_SECONDS } from '../lib/quiz'

const OPTIONS = ['A', 'B', 'C', 'D']

function ProgressRing({ seconds, total, color }) {
  const pct = (seconds / total) * 100
  return (
    <div style={{ position: 'relative', width: 56, height: 56 }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r="24" fill="none" stroke="var(--surface)" strokeWidth="5" />
        <circle
          cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${2 * Math.PI * 24}`}
          strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color }}>
        {seconds}
      </div>
    </div>
  )
}

// ── Tela de regras antes de começar ─────────────────────────────────

function IntroScreen({ onStart, alreadyDone }) {
  return (
    <div className="page">
      <div className="section-title">Quiz da Copa</div>
      <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚽🎵</div>
        <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 10 }}>
          15 perguntas sobre a Copa do Mundo
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16, textAlign: 'left' }}>
          <div style={{ marginBottom: 8 }}>🕐 Cada pergunta tem <b>{QUESTION_PREVIEW_SECONDS}s</b> de preparação e <b>{QUESTION_ANSWER_SECONDS}s</b> pra responder.</div>
          <div style={{ marginBottom: 8 }}>🚫 Não dá pra pausar ou voltar — se você sair no meio, perde a tentativa.</div>
          <div style={{ marginBottom: 8 }}>🎯 Você só tem <b>uma chance</b>. Pense rápido, mas pensa!</div>
          <div style={{ marginBottom: 8 }}>🏆 Quem acertar mais ganha <b>3 meses de Spotify Premium</b>. Em caso de empate, vale o ranking do bolão.</div>
        </div>

        <div style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.25)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 20, textAlign: 'left' }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>⚠️ Atenção</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
            O prêmio só é válido pra quem <b>nunca teve Spotify Premium</b> antes. Se você já teve, o prêmio passa pro próximo colocado.
          </div>
        </div>

        {alreadyDone ? (
          <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '10px 0' }}>
            Você já fez esse quiz! Só dá pra tentar uma vez. 😉
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onStart} style={{ width: '100%' }}>
            Começar agora
          </button>
        )}
      </div>
    </div>
  )
}

// ── Tela de preview (5s antes de cada pergunta) ─────────────────────

function PreviewScreen({ index, total, seconds }) {
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        Pergunta {index + 1} de {total}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Prepare-se...</div>
      <ProgressRing seconds={seconds} total={QUESTION_PREVIEW_SECONDS} color="var(--gold)" />
    </div>
  )
}

// ── Tela de pergunta + alternativas ──────────────────────────────────

function QuestionScreen({ question, index, total, seconds, onAnswer, selected }) {
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Pergunta {index + 1} de {total}
        </div>
        <ProgressRing seconds={seconds} total={QUESTION_ANSWER_SECONDS} color={seconds <= 4 ? 'var(--red)' : 'var(--gold)'} />
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>
          {question.question}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPTIONS.map(opt => {
          const text = question[`option_${opt.toLowerCase()}`]
          const isSelected = selected === opt
          return (
            <button
              key={opt}
              onClick={() => onAnswer(opt)}
              disabled={!!selected}
              className="glass-card"
              style={{
                padding: '14px 16px', textAlign: 'left', border: isSelected ? '1px solid var(--gold)' : undefined,
                background: isSelected ? 'rgba(232,184,75,0.08)' : undefined,
                cursor: selected ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0 }}>
                {opt}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text)' }}>{text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Tela de resultado final ──────────────────────────────────────────

function ResultScreen({ score, total }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{pct >= 70 ? '🏆' : pct >= 40 ? '⚽' : '😅'}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--gold)', letterSpacing: '0.04em', marginBottom: 6 }}>
        {score}<span style={{ fontSize: 20, color: 'var(--text-3)' }}>/{total}</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
        Você acertou {score} de {total} perguntas!
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 280, lineHeight: 1.5 }}>
        O resultado final sai quando o prazo do quiz terminar. Boa sorte! 🍀
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────

export default function QuizPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState(null)
  const [existingAttempt, setExistingAttempt] = useState(null)
  const [phase, setPhase] = useState('intro') // intro | preview | question | result
  const [qIndex, setQIndex] = useState(0)
  const [seconds, setSeconds] = useState(QUESTION_PREVIEW_SECONDS)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const answersRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    async function load() {
      const [{ data: qs }, { data: attempt }] = await Promise.all([
        supabase.from('quiz_questions').select('*').order('order_index'),
        supabase.from('quiz_attempts').select('*').eq('user_id', user.id).maybeSingle(),
      ])
      setQuestions(qs || [])
      setExistingAttempt(attempt || null)
    }
    load()
  }, [user.id])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  // Aviso ao tentar sair da página no meio do quiz
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (phase === 'preview' || phase === 'question') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [phase])

  function startQuiz() {
    answersRef.current = []
    setQIndex(0)
    setScore(0)
    startPreview(0)
  }

  function startPreview(idx) {
    setPhase('preview')
    setSelected(null)
    setSeconds(QUESTION_PREVIEW_SECONDS)
    clearTimer()
    let s = QUESTION_PREVIEW_SECONDS
    timerRef.current = setInterval(() => {
      s -= 1
      setSeconds(s)
      if (s <= 0) {
        clearTimer()
        startQuestion(idx)
      }
    }, 1000)
  }

  function startQuestion(idx) {
    setPhase('question')
    setSeconds(QUESTION_ANSWER_SECONDS)
    clearTimer()
    let s = QUESTION_ANSWER_SECONDS
    timerRef.current = setInterval(() => {
      s -= 1
      setSeconds(s)
      if (s <= 0) {
        clearTimer()
        registerAnswer(idx, null) // tempo esgotado = sem resposta
      }
    }, 1000)
  }

  function registerAnswer(idx, chosen) {
    clearTimer()
    const q = questions[idx]
    const isCorrect = chosen === q.correct_option
    answersRef.current.push({ question_id: q.id, chosen_option: chosen, is_correct: isCorrect })
    setSelected(chosen)
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      const next = idx + 1
      if (next < questions.length) {
        startPreview(next)
        setQIndex(next)
      } else {
        finishQuiz()
      }
    }, 600)
  }

  async function finishQuiz() {
    const finalScore = answersRef.current.filter(a => a.is_correct).length
    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .insert({ user_id: user.id, score: finalScore })
      .select()
      .single()

    if (attempt) {
      const rows = answersRef.current.map(a => ({ ...a, attempt_id: attempt.id }))
      await supabase.from('quiz_answers').insert(rows)
    }

    setScore(finalScore)
    setPhase('result')
  }

  function handleAnswer(opt) {
    if (selected) return
    registerAnswer(qIndex, opt)
  }

  if (questions === null) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
      </div>
    )
  }

  if (phase === 'intro') {
    return <IntroScreen onStart={startQuiz} alreadyDone={!!existingAttempt} />
  }

  if (phase === 'preview') {
    return <PreviewScreen index={qIndex} total={questions.length} seconds={seconds} />
  }

  if (phase === 'question') {
    return (
      <QuestionScreen
        question={questions[qIndex]}
        index={qIndex}
        total={questions.length}
        seconds={seconds}
        onAnswer={handleAnswer}
        selected={selected}
      />
    )
  }

  if (phase === 'result') {
    return <ResultScreen score={score} total={questions.length} />
  }

  return null
}
