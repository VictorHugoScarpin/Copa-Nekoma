import { useLocation } from 'react-router-dom'

const FRASES = [
  { frase: "O futebol é a coisa mais importante das menos importantes.", autor: "Arrigo Sacchi" },
  { frase: "Não existe pressão no futebol. Pressão é não ter o que comer.", autor: "José Mourinho" },
  { frase: "Um dia você vai me agradecer por te fazer chorar hoje.", autor: "Guardiola" },
  { frase: "Vencer não é o mais importante. É a única coisa.", autor: "Vince Lombardi" },
  { frase: "O futebol é simples, mas jogar futebol simples é a coisa mais difícil que existe.", autor: "Johan Cruyff" },
  { frase: "Quanto mais eu treino, mais sorte eu tenho.", autor: "Ronaldo Fenômeno" },
  { frase: "O talento vence jogos, mas o trabalho em equipe vence campeonatos.", autor: "Michael Jordan" },
  { frase: "Prefiro ganhar 1 a 0 do que perder 5 a 4.", autor: "Mourinho" },
  { frase: "No futebol tudo é possível, especialmente o impossível.", autor: "Didier Deschamps" },
  { frase: "O gol mais bonito é o próximo.", autor: "Pelé" },
  { frase: "Futebol é arte. E arte não tem explicação.", autor: "Sócrates" },
  { frase: "Dentro de campo somos iguais. Fora, somos humanos.", autor: "Zidane" },
  { frase: "A bola não entra por acaso. Entra por trabalho.", autor: "Cristiano Ronaldo" },
  { frase: "Quem não arrisca, não petisca. No futebol e na vida.", autor: "Romário" },
  { frase: "Um time que acredita pode derrotar qualquer um.", autor: "Miroslav Klose" },
  { frase: "O futebol é o único esporte onde você pode fazer nada e ser herói.", autor: "Cantona" },
  { frase: "Ganhar é um hábito. Infelizmente, perder também.", autor: "Vince Lombardi" },
  { frase: "Jogo bonito não é o que parece bonito. É o que vence.", autor: "Carlo Ancelotti" },
  { frase: "Minha religião é o futebol.", autor: "Ronaldinho Gaúcho" },
  { frase: "Quando a Copa começa, o mundo para.", autor: "Pelé" },
]

function getFraseDodia() {
  const inicio = new Date('2026-06-29')
  const hoje = new Date()
  const diff = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24))
  return FRASES[diff % FRASES.length]
}

export default function TopHeader() {
  const { frase, autor } = getFraseDodia()

  return (
    <header className="top-header">
      <img
        src="/neko.png"
        alt="Neko"
        style={{ height: '56px', filter: 'drop-shadow(0 0 8px rgba(232,184,75,0.45))', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none' }}
      />

      <div style={{
        flex: 1,
        margin: '0 12px',
        overflow: 'hidden',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          fontStyle: 'italic',
          color: 'var(--text-3)',
          lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          margin: 0,
        }}>
          "{frase}" <span style={{ color: 'var(--gold)', fontStyle: 'normal', fontWeight: 600, whiteSpace: 'nowrap' }}>— {autor}</span>
        </p>
      </div>

      <img
        src="/copa2026.png"
        alt="Copa 2026"
        style={{ height: '56px', filter: 'drop-shadow(0 0 8px rgba(232,184,75,0.45))', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none' }}
      />
    </header>
  )
}
