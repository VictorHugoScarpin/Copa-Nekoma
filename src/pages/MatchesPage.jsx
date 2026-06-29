import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { format, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TEAM_ISO = {
  'Brazil': 'br', 'Argentina': 'ar', 'France': 'fr', 'Germany': 'de',
  'Spain': 'es', 'England': 'gb-eng', 'Portugal': 'pt', 'Netherlands': 'nl',
  'Italy': 'it', 'Uruguay': 'uy', 'Colombia': 'co', 'Mexico': 'mx',
  'United States': 'us', 'USA': 'us', 'Canada': 'ca', 'Japan': 'jp',
  'South Korea': 'kr', 'Korea Republic': 'kr', 'Morocco': 'ma',
  'Senegal': 'sn', 'Ghana': 'gh', 'Nigeria': 'ng', 'Australia': 'au',
  'Saudi Arabia': 'sa', 'Iran': 'ir', 'IR Iran': 'ir', 'Qatar': 'qa',
  'Croatia': 'hr', 'Serbia': 'rs', 'Switzerland': 'ch', 'Belgium': 'be',
  'Denmark': 'dk', 'Poland': 'pl', 'Cameroon': 'cm', 'Ecuador': 'ec',
  'Tunisia': 'tn', 'Costa Rica': 'cr', 'Wales': 'gb-wls',
  'Chile': 'cl', 'Peru': 'pe', 'Paraguay': 'py', 'Venezuela': 've',
  'Bolivia': 'bo', 'Austria': 'at', 'Turkey': 'tr', 'Ukraine': 'ua',
  'Honduras': 'hn', 'Panama': 'pa', 'Jamaica': 'jm',
  'Slovakia': 'sk', 'Romania': 'ro', 'Hungary': 'hu',
  'Czechia': 'cz', 'Czech Republic': 'cz', 'Slovenia': 'si',
  'Algeria': 'dz', 'Egypt': 'eg', 'New Zealand': 'nz',
  "Côte d'Ivoire": 'ci', 'Ivory Coast': 'ci',
  'Guatemala': 'gt', 'El Salvador': 'sv',
  'South Africa': 'za', 'Bosnia and Herzegovina': 'ba', 'Bosnia & Herzegovina': 'ba',
  'Haiti': 'ht', 'Curaçao': 'cw', 'Curacao': 'cw',
  'Cape Verde': 'cv', 'Cape Verde Islands': 'cv',
  'Congo DR': 'cd', 'DR Congo': 'cd',
  'Scotland': 'gb-sct', 'Northern Ireland': 'gb-nir', 'Ireland': 'ie',
  'Greece': 'gr', 'Norway': 'no', 'Sweden': 'se', 'Finland': 'fi',
  'Albania': 'al', 'North Macedonia': 'mk', 'Montenegro': 'me',
  'Georgia': 'ge', 'Kosovo': 'xk',
  'Trinidad and Tobago': 'tt', 'Cuba': 'cu', 'Nicaragua': 'ni',
  'Suriname': 'sr', 'Guyana': 'gy',
  'Kenya': 'ke', 'Tanzania': 'tz', 'Uganda': 'ug', 'Mali': 'ml',
  'Mozambique': 'mz', 'Angola': 'ao', 'Zambia': 'zm', 'Zimbabwe': 'zw',
  'Togo': 'tg', 'Benin': 'bj', 'Guinea': 'gn', 'Burkina Faso': 'bf',
  'Ethiopia': 'et', 'Namibia': 'na', 'Mauritania': 'mr',
  'Thailand': 'th', 'Vietnam': 'vn', 'Indonesia': 'id',
  'Philippines': 'ph', 'Malaysia': 'my', 'China': 'cn',
  'India': 'in', 'Uzbekistan': 'uz', 'Kazakhstan': 'kz',
  'Iraq': 'iq', 'Jordan': 'jo', 'United Arab Emirates': 'ae', 'UAE': 'ae',
  'Oman': 'om', 'Kuwait': 'kw', 'Bahrain': 'bh',
  'Bosnia Herzegovina': 'ba', 'Bosna i Hercegovina': 'ba', 'Bosnia-Herzegovina': 'ba',
}

const TEAM_PT = {
  'Brazil': 'Brasil', 'Argentina': 'Argentina', 'France': 'França',
  'Germany': 'Alemanha', 'Spain': 'Espanha', 'England': 'Inglaterra',
  'Portugal': 'Portugal', 'Netherlands': 'Holanda', 'Italy': 'Itália',
  'Uruguay': 'Uruguai', 'Colombia': 'Colômbia', 'Mexico': 'México',
  'United States': 'EUA', 'USA': 'EUA', 'Canada': 'Canadá',
  'Japan': 'Japão', 'South Korea': 'Coreia do Sul', 'Korea Republic': 'Coreia do Sul',
  'Morocco': 'Marrocos', 'Senegal': 'Senegal', 'Ghana': 'Gana',
  'Nigeria': 'Nigéria', 'Australia': 'Austrália', 'Saudi Arabia': 'Arábia Saudita',
  'Iran': 'Irã', 'IR Iran': 'Irã', 'Qatar': 'Catar', 'Croatia': 'Croácia',
  'Serbia': 'Sérvia', 'Switzerland': 'Suíça', 'Belgium': 'Bélgica',
  'Denmark': 'Dinamarca', 'Poland': 'Polônia', 'Cameroon': 'Camarões',
  'Ecuador': 'Equador', 'Tunisia': 'Tunísia', 'Costa Rica': 'Costa Rica',
  'Wales': 'País de Gales', 'Chile': 'Chile', 'Peru': 'Peru',
  'Paraguay': 'Paraguai', 'Venezuela': 'Venezuela', 'Bolivia': 'Bolívia',
  'Austria': 'Áustria', 'Turkey': 'Turquia', 'Ukraine': 'Ucrânia',
  'Honduras': 'Honduras', 'Panama': 'Panamá', 'Jamaica': 'Jamaica',
  'Slovakia': 'Eslováquia', 'Romania': 'Romênia', 'Hungary': 'Hungria',
  'Czechia': 'Rep. Tcheca', 'Czech Republic': 'Rep. Tcheca',
  'Slovenia': 'Eslovênia', 'Algeria': 'Argélia', 'Egypt': 'Egito',
  'New Zealand': 'Nova Zelândia', "Côte d'Ivoire": 'Costa do Marfim',
  'Ivory Coast': 'Costa do Marfim', 'Guatemala': 'Guatemala',
  'El Salvador': 'El Salvador', 'South Africa': 'África do Sul',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia-Herzegovina': 'Bósnia e Herzegovina',
  'Haiti': 'Haiti', 'Curaçao': 'Curaçao', 'Curacao': 'Curaçao',
  'Cape Verde': 'Cabo Verde', 'Cape Verde Islands': 'Cabo Verde',
  'Congo DR': 'Congo RD', 'DR Congo': 'Congo RD',
  'Scotland': 'Escócia', 'Northern Ireland': 'Irlanda do Norte', 'Ireland': 'Irlanda',
  'Greece': 'Grécia', 'Norway': 'Noruega', 'Sweden': 'Suécia',
  'Finland': 'Finlândia', 'Albania': 'Albânia',
  'North Macedonia': 'Macedônia do Norte', 'Montenegro': 'Montenegro',
  'Georgia': 'Geórgia', 'Kosovo': 'Kosovo',
  'Trinidad and Tobago': 'Trinidad e Tobago', 'Cuba': 'Cuba',
  'United Arab Emirates': 'Emirados Árabes', 'UAE': 'Emirados Árabes',
  'Bosnia Herzegovina': 'Bósnia e Herzegovina',
  'Bosna i Hercegovina': 'Bósnia e Herzegovina',
}

const STAGE_PT = {
  'LAST_32':        'Fase de 32',
  'LAST_16':        'Oitavas de final',
  'QUARTER_FINAL':  'Quartas de final',
  'SEMI_FINAL':     'Semifinal',
  'FINAL':          'Final',
  // variações possíveis da API
  'Round of 32':    'Fase de 32',
  'Round of 16':    'Oitavas de final',
  'Quarter-final':  'Quartas de final',
  'Semi-final':     'Semifinal',
  'Final':          'Final',
}

function getStagePT(stage) {
  return STAGE_PT[stage] || stage
}

// Brasões fixos por seleção (Wikipedia)
const TEAM_SHIELD = {
  'United States': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/United_States_Soccer_Federation_logo.svg/200px-United_States_Soccer_Federation_logo.svg.png',
  'USA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/United_States_Soccer_Federation_logo.svg/200px-United_States_Soccer_Federation_logo.svg.png',
  'Canada': 'https://upload.wikimedia.org/wikipedia/pt/thumb/4/4e/Logotipo_Sele%C3%A7%C3%A3o_Canad%C3%A1.png/200px-Logotipo_Sele%C3%A7%C3%A3o_Canad%C3%A1.png',
  'Mexico': 'https://upload.wikimedia.org/wikipedia/pt/thumb/f/f7/Mexico_national_football_team_crest_%282022%29.png/200px-Mexico_national_football_team_crest_%282022%29.png',
  'Argentina': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Afa_logo.svg/200px-Afa_logo.svg.png',
  'Brazil': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Brazilian_Football_Confederation_logo.svg/200px-Brazilian_Football_Confederation_logo.svg.png',
  'Colombia': 'https://upload.wikimedia.org/wikipedia/pt/thumb/a/a2/FCF-Logo-2023.svg/200px-FCF-Logo-2023.svg.png',
  'Ecuador': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Logo_de_la_Federaci%C3%B3n_Ecuatoriana_de_F%C3%BAtbol_%282%29.svg/200px-Logo_de_la_Federaci%C3%B3n_Ecuatoriana_de_F%C3%BAtbol_%282%29.svg.png',
  'Paraguay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Asociaci%C3%B3n_Paraguaya_de_F%C3%BAtbol_logo.svg/200px-Asociaci%C3%B3n_Paraguaya_de_F%C3%BAtbol_logo.svg.png',
  'Uruguay': 'https://upload.wikimedia.org/wikipedia/pt/thumb/1/1d/AUF.png/200px-AUF.png',
  'Germany': 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/05/DFBEagle.png/200px-DFBEagle.png',
  'Austria': 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/93/OFB.png/200px-OFB.png',
  'Belgium': 'https://upload.wikimedia.org/wikipedia/pt/thumb/8/88/Royal_Belgian_FA_logo_2019.png/200px-Royal_Belgian_FA_logo_2019.png',
  'Bosnia and Herzegovina': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/5a/Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png/200px-Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png',
  'Bosnia & Herzegovina': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/5a/Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png/200px-Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png',
  'Bosnia Herzegovina': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/5a/Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png/200px-Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png',
  'Bosna i Hercegovina': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/5a/Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png/200px-Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png',
  'Bosnia-Herzegovina': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/5a/Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png/200px-Logo_of_the_Football_Association_of_Bosnia_and_Herzegovina_%282013-present%29.png',
  'Croatia': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/56/Croatia_football_federation.png/200px-Croatia_football_federation.png',
  'Scotland': 'https://upload.wikimedia.org/wikipedia/pt/thumb/e/e4/Sele%C3%A7%C3%A3o_Escocesa_logo.png/200px-Sele%C3%A7%C3%A3o_Escocesa_logo.png',
  'Spain': 'https://upload.wikimedia.org/wikipedia/pt/thumb/4/44/Spain_National_Football_Team_badge.png/200px-Spain_National_Football_Team_badge.png',
  'France': 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/92/France_national_football_team_seal.png/200px-France_national_football_team_seal.png',
  'Netherlands': 'https://upload.wikimedia.org/wikipedia/pt/thumb/2/2d/Netherlands_national_football_team_logo_2017.png/200px-Netherlands_national_football_team_logo_2017.png',
  'England': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Arms_of_The_Football_Association_%28include_star%29.svg/200px-Arms_of_The_Football_Association_%28include_star%29.svg.png',
  'Norway': 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0f/Sele%C3%A7%C3%A3o_Norueguesa_de_Futebol_Logo.png/200px-Sele%C3%A7%C3%A3o_Norueguesa_de_Futebol_Logo.png',
  'Portugal': 'https://upload.wikimedia.org/wikipedia/pt/thumb/7/77/Portugal_FPF.png/200px-Portugal_FPF.png',
  'Czechia': 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/96/FACR.png/200px-FACR.png',
  'Czech Republic': 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/96/FACR.png/200px-FACR.png',
  'Sweden': 'https://upload.wikimedia.org/wikipedia/pt/thumb/4/4c/SFSverige.png/200px-SFSverige.png',
  'Switzerland': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/SFV_Logo.svg/200px-SFV_Logo.svg.png',
  'Turkey': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Roundel_flag_of_Turkey.svg/200px-Roundel_flag_of_Turkey.svg.png',
  'South Africa': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglkJg-eh2-jUVDcg2ASv8jKkjGYRCWywKH_TdC1tqU4CO__UcPJU6TQdqumzfWoHwqXF_NAATeKxgd5XCOobFOs5xnYm0cBL0Nmaw2gnwRyaQ-Ge0s4YZ1V9XEeqbpM_PwiKlopOqPQas/s800/%C3%81frica+do+Sul+-+South+African+Football+Association.png',
  'Algeria': 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/02/Algeria_National_Football_Team_logo.png/200px-Algeria_National_Football_Team_logo.png',
  'Cape Verde': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/59/Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png/200px-Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png',
  'Cape Verde Islands': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/59/Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png/200px-Federa%C3%A7%C3%A3o_Cabo-Verdiana_de_Futebol.png',
  "Côte d'Ivoire": 'https://upload.wikimedia.org/wikipedia/pt/thumb/8/8e/F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png/200px-F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png',
  'Ivory Coast': 'https://upload.wikimedia.org/wikipedia/pt/thumb/8/8e/F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png/200px-F%C3%A9d%C3%A9ration_Ivorienne_de_Football.png',
  'Egypt': 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/95/Egyptian_Football_Association.png/200px-Egyptian_Football_Association.png',
  'Ghana': 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0d/Ghana_Football_Association.png/200px-Ghana_Football_Association.png',
  'Morocco': 'https://upload.wikimedia.org/wikipedia/pt/thumb/8/8c/F%C3%A9d%C3%A9ration_Royale_Marocaine_de_Football.png/200px-F%C3%A9d%C3%A9ration_Royale_Marocaine_de_Football.png',
  'Congo DR': 'https://upload.wikimedia.org/wikipedia/pt/thumb/7/74/F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png/200px-F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png',
  'DR Congo': 'https://upload.wikimedia.org/wikipedia/pt/thumb/7/74/F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png/200px-F%C3%A9d%C3%A9ration_Congolaise_de_Football_Association.png',
  'Senegal': 'https://upload.wikimedia.org/wikipedia/pt/thumb/8/8c/FSenegalaiseF.png/200px-FSenegalaiseF.png',
  'Tunisia': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/5a/F%C3%A9d%C3%A9ration_Tunisienne_de_Football.png/200px-F%C3%A9d%C3%A9ration_Tunisienne_de_Football.png',
  'Saudi Arabia': 'https://upload.wikimedia.org/wikipedia/pt/thumb/8/86/SAFF.png/200px-SAFF.png',
  'Australia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Australia_national_football_team_badge.svg/200px-Australia_national_football_team_badge.svg.png',
  'Qatar': 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/91/Associa%C3%A7%C3%A3o_do_Qatar_de_Futebol.png/200px-Associa%C3%A7%C3%A3o_do_Qatar_de_Futebol.png',
  'South Korea': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/55/South_Korea_national_football_team_logo.png/200px-South_Korea_national_football_team_logo.png',
  'Korea Republic': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/55/South_Korea_national_football_team_logo.png/200px-South_Korea_national_football_team_logo.png',
  'Iran': 'https://upload.wikimedia.org/wikipedia/pt/thumb/2/2f/Football_Federation_Islamic_Republic_of_Iran.png/200px-Football_Federation_Islamic_Republic_of_Iran.png',
  'IR Iran': 'https://upload.wikimedia.org/wikipedia/pt/thumb/2/2f/Football_Federation_Islamic_Republic_of_Iran.png/200px-Football_Federation_Islamic_Republic_of_Iran.png',
  'Iraq': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Iraq_National_Team_Badge_2021_v2.svg/200px-Iraq_National_Team_Badge_2021_v2.svg.png',
  'Japan': 'https://upload.wikimedia.org/wikipedia/pt/thumb/8/86/JapanFA.png/200px-JapanFA.png',
  'Jordan': 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/04/Jordan_Football_Association.png/200px-Jordan_Football_Association.png',
  'Uzbekistan': 'https://upload.wikimedia.org/wikipedia/pt/thumb/3/3a/Uzbekistan_Football_Federation.png/200px-Uzbekistan_Football_Federation.png',
  'Curaçao': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/56/Federashon_Futb%C3%B2l_K%C3%B2rsou.png/200px-Federashon_Futb%C3%B2l_K%C3%B2rsou.png',
  'Curacao': 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/56/Federashon_Futb%C3%B2l_K%C3%B2rsou.png/200px-Federashon_Futb%C3%B2l_K%C3%B2rsou.png',
  'Haiti': 'https://upload.wikimedia.org/wikipedia/pt/thumb/a/a3/Federation_Haitienne_de_Football.png/200px-Federation_Haitienne_de_Football.png',
  'Panama': 'https://upload.wikimedia.org/wikipedia/pt/thumb/6/6c/Panama_FA_2.svg.png/200px-Panama_FA_2.svg.png',
}

// Bandeiras salvas localmente em /public (para países com problema no flagcdn)
const FLAG_LOCAL = {
  'Argentina': '/ar.png',
  'Bosnia and Herzegovina': '/ba.png',
  'Bosnia & Herzegovina': '/ba.png',
  'Bosnia Herzegovina': '/ba.png',
  'Bosna i Hercegovina': '/ba.png',
  'Bosnia-Herzegovina': '/ba.png',
  'Jordan': '/jor.png',
  'Korea Republic': '/cor.png',
  'South Korea': '/cor.png',
  'Uzbekistan': '/uz.png',
}

function getFlagUrl(name) {
  if (FLAG_LOCAL[name]) return FLAG_LOCAL[name]
  const iso = TEAM_ISO[name]
  return iso ? `https://flagcdn.com/w160/${iso}.png` : null
}

function getShieldUrl(name) {
  return TEAM_SHIELD[name] || null
}

function getPT(name) {
  return TEAM_PT[name] || name
}

// Bolinha: sempre bandeira, cover 100%
function TeamCircle({ name, size = 46 }) {
  const flagUrl = getFlagUrl(name)

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.18)',
      background: 'var(--surface)',
    }}>
      {flagUrl ? (
        <img
          src={flagUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', fontSize: size * 0.42 }}>🏳️</div>
      )}
    </div>
  )
}

// Bolinha do jogador: mostra a foto (photo_url); se não tiver ou der erro, cai pra bandeira
function PlayerCircle({ team, photoUrl, size = 36 }) {
  const [imgError, setImgError] = useState(false)
  const flagUrl = getFlagUrl(team)
  const showPhoto = !!photoUrl && !imgError

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.18)',
      background: 'var(--surface)',
    }}>
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={team}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : flagUrl ? (
        <img src={flagUrl} alt={team} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: size * 0.42 }}>🏳️</div>
      )}
    </div>
  )
}

// Fundo do card: bandeira preenchendo cada lado, com fade no centro
function CardBg({ name, side }) {
  const flagUrl = getFlagUrl(name)
  if (!flagUrl) return null

  const gradientDir = side === 'left' ? 'to right' : 'to left'

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0,
      width: '50%', overflow: 'hidden', pointerEvents: 'none',
    }}>
      <img src={flagUrl} alt="" style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        opacity: 0.18,
        filter: 'saturate(1.4)',
      }} onError={e => { e.target.style.display = 'none' }} />
      {/* Fade suave em direção ao centro */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(${gradientDir}, transparent 20%, rgba(6,11,20,0.85) 100%)`,
      }} />
    </div>
  )
}

const CAZETV_URL = 'https://cazetv.com.br/ao-vivo'
const MATCH_DURATION_MS = 130 * 60 * 1000 // 2h10min

function isMatchLive(match) {
  if (match.status === 'finished') return false
  const start = parseISO(match.match_date).getTime()
  const now = Date.now()
  return now >= start && now <= start + MATCH_DURATION_MS
}

function MatchCard({ match }) {
  const finished = match.status === 'finished'
  const live = isMatchLive(match)

  return (
    <div style={{
      position: 'relative',
      background: live ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${live ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '14px', overflow: 'hidden', padding: '0',
      transition: 'border-color 0.2s', marginBottom: '8px',
    }}>
      <CardBg name={match.home_team} side="left" />
      <CardBg name={match.away_team} side="right" />
      {/* Overlay escuro no centro para legibilidade do placar/horário */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 80% at 50% 50%, rgba(6,11,20,0.55) 0%, transparent 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
        {/* Topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 600,
            color: 'rgba(240,244,255,0.35)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {getStagePT(match.stage)}{match.group_name ? ` · ${match.group_name}` : ''}
          </span>
          {live && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#ef4444', fontWeight: 700, letterSpacing: '0.06em' }}>
              <div className="live-dot" /> AO VIVO
            </span>
          )}
        </div>

        {/* Times */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
            <TeamCircle name={match.home_team} size={46} />
            <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text)', width: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getPT(match.home_team)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0, minWidth: '80px' }}>
            {finished ? (
              <>
                {match.penalty_home != null && match.penalty_away != null ? (
                  // Pênaltis: Brasil 0 (5) × (4) 0 Argentina
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.02em', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {match.home_score}
                      <span style={{ fontSize: '16px', color: 'rgba(240,244,255,0.55)', margin: '0 1px' }}>({match.penalty_home})</span>
                      <span style={{ color: 'rgba(240,244,255,0.25)', margin: '0 2px', fontSize: '20px' }}>–</span>
                      <span style={{ fontSize: '16px', color: 'rgba(240,244,255,0.55)', margin: '0 1px' }}>({match.penalty_away})</span>
                      {match.away_score}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(240,244,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pênaltis</div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.04em', lineHeight: 1 }}>
                    {match.home_score}<span style={{ color: 'rgba(240,244,255,0.25)', margin: '0 4px', fontSize: '22px' }}>–</span>{match.away_score}
                  </div>
                )}
              </>
            ) : live ? (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.04em', lineHeight: 1, color: '#ef4444' }}>
                {match.home_score ?? 0}<span style={{ color: 'rgba(239,68,68,0.4)', margin: '0 4px', fontSize: '22px' }}>–</span>{match.away_score ?? 0}
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.04em', lineHeight: 1, color: 'var(--gold-bright)' }}>
                {format(parseISO(match.match_date), 'HH:mm')}
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {finished ? (match.penalty_home != null ? 'Encerrado' : 'Encerrado') : live ? 'Ao vivo' : format(parseISO(match.match_date), 'dd/MM')}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
            <TeamCircle name={match.away_team} size={46} />
            <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text)', width: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getPT(match.away_team)}
            </span>
          </div>
        </div>

        {live && (
          <a href={match.stream_url || CAZETV_URL} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '12px', padding: '8px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: '12px', fontWeight: 700, textDecoration: 'none',
          }}>
            📺 Assistir na CazéTV
          </a>
        )}
      </div>
    </div>
  )
}

function getTabMatches(matches, tab) {
  const todayStart = startOfDay(new Date())
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  if (tab === 'ontem') return matches.filter(m => { const d = parseISO(m.match_date); return d >= yesterdayStart && d < todayStart })
  if (tab === 'hoje') return matches.filter(m => { const d = parseISO(m.match_date); return d >= todayStart && d < todayEnd })
  if (tab === 'proximos') return matches.filter(m => parseISO(m.match_date) >= todayEnd)
  return []
}

function StatsTab() {
  const [scorers, setScorers] = useState([])
  const [assists, setAssists] = useState([])
  const [statsTab, setStatsTab] = useState('scorers')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('top_scorers').select('*').order('goals', { ascending: false }).limit(10),
      supabase.from('top_assists').select('*').order('assists', { ascending: false }).limit(10),
    ]).then(([s, a]) => {
      setScorers(s.data || [])
      setAssists(a.data || [])
      setLoading(false)
    })
  }, [])

  const data = statsTab === 'scorers' ? scorers : assists
  const key = statsTab === 'scorers' ? 'goals' : 'assists'
  const label = statsTab === 'scorers' ? 'gols' : 'assist.'
  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
        {[['scorers', 'Artilheiros'], ['assists', 'Assistências']].map(([k, l]) => (
          <button key={k} onClick={() => setStatsTab(k)} style={{
            flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            background: 'transparent',
            color: statsTab === k ? 'var(--text)' : 'var(--text-3)',
            borderBottom: `2px solid ${statsTab === k ? 'var(--gold)' : 'transparent'}`,
            transition: 'all 0.2s', letterSpacing: '0.02em',
          }}>{l}</button>
        ))}
      </div>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 10 }} />)
        : data.length === 0
          ? <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: '14px' }}>Disponível após o início da Copa.</div>
          : data.map((p, i) => (
            <div key={p.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: 24, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '16px', color: i < 3 ? 'var(--gold)' : 'var(--text-3)', flexShrink: 0 }}>{i < 3 ? MEDALS[i] : `${i + 1}º`}</div>
              <PlayerCircle team={p.team_name} photoUrl={p.photo_url} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TeamCircle name={p.team_name} size={16} />
                  {TEAM_PT[p.team_name] || p.team_name}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>{p[key]}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</div>
              </div>
            </div>
          ))
      }
    </div>
  )
}

// Bottom sheet para escolher seleções a filtrar
function TeamFilterSheet({ allTeams, selected, onToggle, onClose, onClear }) {
  // Trava o scroll do body enquanto o sheet está aberto — evita que a página
  // de fundo "pule" e arraste o modal junto quando o conteúdo atrás muda
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeUp 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--deep)', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: '480px',
          height: '70vh',
          border: '1px solid var(--border)', borderBottom: 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header fixo no topo absoluto */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '64px', zIndex: 2, background: 'var(--deep)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-strong)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 18px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.06em', color: 'var(--text)' }}>
              Filtrar Seleções
            </div>
            {selected.length > 0 && (
              <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Limpar ({selected.length})
              </button>
            )}
          </div>
        </div>

        {/* Lista — posicionada absoluta entre header e footer, com altura travada por top/bottom */}
        <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, bottom: '76px', overflowY: 'auto', padding: '4px 12px 12px' }}>
          {allTeams.map(team => {
            const isSelected = selected.includes(team)
            return (
              <button
                key={team}
                onClick={() => onToggle(team)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '10px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: isSelected ? 'rgba(232,184,75,0.10)' : 'transparent',
                  marginBottom: '2px', textAlign: 'left',
                }}
              >
                <TeamCircle name={team} size={32} />
                <span style={{ flex: 1, fontSize: '14px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--gold-bright)' : 'var(--text)' }}>
                  {getPT(team)}
                </span>
                <div style={{
                  width: 20, height: 20, borderRadius: '6px', flexShrink: 0,
                  border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--border-strong)'}`,
                  background: isSelected ? 'var(--gold)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <span style={{ color: 'var(--void)', fontSize: '13px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer fixo no fundo absoluto — nunca se move */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '76px', zIndex: 2, background: 'var(--deep)', padding: '12px 18px', paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Ver jogos {selected.length > 0 ? `(${selected.length} seleções)` : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('jogos')
  const [dayTab, setDayTab] = useState('hoje')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterTeams, setFilterTeams] = useState([])

  useEffect(() => {
    supabase.from('matches').select('*').order('match_date').then(({ data }) => {
      const all = data || []
      setMatches(all)
      setLoading(false)
      if (getTabMatches(all, 'hoje').length === 0) setDayTab('proximos')
    })
  }, [])

  const allTeams = useMemo(() => {
    const set = new Set()
    matches.forEach(m => { set.add(m.home_team); set.add(m.away_team) })
    return [...set].sort((a, b) => getPT(a).localeCompare(getPT(b), 'pt-BR'))
  }, [matches])

  const isFiltering = filterTeams.length > 0

  function toggleFilterTeam(team) {
    setFilterTeams(prev => prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team])
  }

  const tabMatches = useMemo(() => {
    if (isFiltering) {
      return matches
        .filter(m => filterTeams.includes(m.home_team) || filterTeams.includes(m.away_team))
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
    }
    return getTabMatches(matches, dayTab)
  }, [matches, dayTab, isFiltering, filterTeams])

  const grouped = useMemo(() => {
    const g = {}
    tabMatches.forEach(m => {
      const d = format(parseISO(m.match_date), "EEEE, dd 'de' MMMM", { locale: ptBR })
      if (!g[d]) g[d] = []
      g[d].push(m)
    })
    return g
  }, [tabMatches])

  return (
    <div className="page">
      {/* Aviso de API */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)',
        borderRadius: '10px', padding: '9px 12px', marginBottom: '14px',
        fontSize: '11px', color: 'rgba(232,184,75,0.75)', lineHeight: 1.4,
      }}>
        <span>Os resultados dependem de uma API externa e podem demorar alguns minutos para atualizar.</span>
      </div>
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '16px', gap: '4px' }}>
        {[['jogos', 'Jogos'], ['stats', 'Artilheiros']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text)' : 'var(--text-3)' }}>{label}</button>
        ))}
      </div>

      {tab === 'stats' ? <StatsTab /> : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', flex: 1, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onTouchStart={e => { e._touchX = e.touches[0].clientX }}
              onTouchEnd={e => {
                if (isFiltering) return
                const dx = e.changedTouches[0].clientX - (e._touchX || 0)
                const tabs = ['ontem','hoje','proximos']
                const cur = tabs.indexOf(dayTab)
                if (dx < -40 && cur < tabs.length - 1) setDayTab(tabs[cur + 1])
                if (dx > 40 && cur > 0) setDayTab(tabs[cur - 1])
              }}
            >
              {[['ontem', 'Ontem'], ['hoje', 'Hoje'], ['proximos', 'Próximos']].map(([key, label]) => (
                <button key={key} onClick={() => { setDayTab(key); setFilterTeams([]) }} style={{
                  flexShrink: 0, flex: 1, minWidth: '80px', padding: '10px 8px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                  background: 'transparent',
                  color: !isFiltering && dayTab === key ? 'var(--text)' : 'var(--text-3)',
                  borderBottom: `2px solid ${!isFiltering && dayTab === key ? 'var(--gold)' : 'transparent'}`,
                  transition: 'all 0.2s', letterSpacing: '0.02em',
                  opacity: isFiltering ? 0.4 : 1,
                }}>{label}</button>
              ))}
            </div>

            {/* Botão de filtro por seleção */}
            <button
              onClick={() => setFilterOpen(true)}
              style={{
                flexShrink: 0, padding: '10px 12px', border: 'none', cursor: 'pointer',
                background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isFiltering ? 'var(--gold)' : 'var(--text-3)',
                borderBottom: `2px solid ${isFiltering ? 'var(--gold)' : 'transparent'}`,
                transition: 'all 0.2s',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          </div>

          {/* Bolinhas das seleções filtradas */}
          {isFiltering && !filterOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 2px 4px' }}>
              {filterTeams.map(team => (
                <button
                  key={team}
                  onClick={() => toggleFilterTeam(team)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(232,184,75,0.10)', border: '1px solid rgba(232,184,75,0.25)',
                    borderRadius: '99px', padding: '4px 10px 4px 4px', cursor: 'pointer',
                  }}
                >
                  <TeamCircle name={team} size={22} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-bright)' }}>{getPT(team)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)', marginLeft: '2px' }}>✕</span>
                </button>
              ))}
            </div>
          )}

          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 130, marginBottom: 10, borderRadius: 14, marginTop: i === 0 ? '8px' : 0 }} />)
            : tabMatches.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '60px 0', fontSize: '14px' }}>
                  {isFiltering ? 'Nenhum jogo dessas seleções.' : dayTab === 'ontem' ? 'Nenhum jogo ontem.' : dayTab === 'hoje' ? 'Nenhum jogo hoje.' : 'Nenhum jogo futuro cadastrado.'}
                </div>
              : Object.entries(grouped).map(([date, dayMatches]) => (
                <div key={date} style={{ marginBottom: '24px', marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '2px' }}>
                    {date}
                  </div>
                  <div className="matches-grid">
                    {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
                  </div>
                </div>
              ))
          }
        </>
      )}

      {filterOpen && (
        <TeamFilterSheet
          allTeams={allTeams}
          selected={filterTeams}
          onToggle={toggleFilterTeam}
          onClose={() => setFilterOpen(false)}
          onClear={() => setFilterTeams([])}
        />
      )}
    </div>
  )
}
