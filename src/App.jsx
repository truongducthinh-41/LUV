import { useState, useEffect, useRef } from 'react'

function App() {
  const [step, setStep] = useState(0) // 0: Name, 1: Question (Dodge), 2: Happy (Transition), 3: Gallery, 4: Swimming & Monologue
  const [name, setName] = useState('')
  const [duckState, setDuckState] = useState('normal') // 'normal' | 'sad' | 'happy' | 'swimming'
  const [bubbleText, setBubbleText] = useState('Xin chào! Tớ có điều muốn hỏi cậu...')
  const [noBtnStyle, setNoBtnStyle] = useState({ position: 'relative' })
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isNightTheme, setIsNightTheme] = useState(false)
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [typedText, setTypedText] = useState('')

  const playerRef = useRef(null)
  const typingTimerRef = useRef(null)
  const heartsRef = useRef([])
  const starsRef = useRef([])

  const dialogues = [
    "tớ cũng nhớ cậu 🩵",
    "tớ sẽ ở đây đợi cậu",
    "cho dù là cậu có ở đâu",
    "có hạnh phúc hay chưa",
    "hay cậu có biến mất một lần nữa",
    "thì tớ vẫn bơi đến tìm cậu 🌊",
    "Điều cuối cùng tớ muốn nói với cậu là",
    "tớ yêu cậu",
    "vẫn sẽ yêu cậu dù thế nào...",
    "bây giờ thì tối rồi",
    "chúc cậu ngủ ngonn. 💤"
  ]

  // Pre-generate random coordinates for hearts and stars so they don't change on render
  if (heartsRef.current.length === 0) {
    for (let i = 0; i < 15; i++) {
      heartsRef.current.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        scale: 0.5 + Math.random() * 0.8
      })
    }
  }

  if (starsRef.current.length === 0) {
    for (let i = 0; i < 40; i++) {
      starsRef.current.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 3
      })
    }
  }

  // Load YouTube Player API
  useEffect(() => {
    // Inject script
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    // Assign globally to catch event
    window.onYouTubeIframeAPIReady = () => {
      initYTPlayer()
    }

    if (window.YT && window.YT.Player) {
      initYTPlayer()
    }

    return () => {
      // Clean up callback if needed
    }
  }, [])

  const initYTPlayer = () => {
    if (playerRef.current) return
    playerRef.current = new window.YT.Player('hidden-player', {
      height: '0',
      width: '0',
      videoId: 'i7ZyZHIY2Jw',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        showinfo: 0,
        start: 22,
      },
      events: {
        onReady: (event) => {
          event.target.setVolume(50)
          if (isMusicPlaying) {
            event.target.playVideo()
          }
        }
      }
    })
  }

  const toggleMusic = () => {
    const nextState = !isMusicPlaying
    setIsMusicPlaying(nextState)
    if (playerRef.current && playerRef.current.playVideo) {
      if (nextState) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    }
  }

  // Synchronize night theme with body class
  useEffect(() => {
    document.body.classList.toggle('theme-night', isNightTheme)
  }, [isNightTheme])

  // Typewriter effect logic
  useEffect(() => {
    if (step === 4) {
      const targetText = dialogues[dialogueIndex]
      setTypedText('')
      let currentLength = 0

      // Clear any running timer
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)

      // Start night theme when reaching night dialogues
      if (dialogueIndex >= 9) {
        setIsNightTheme(true)
      } else {
        setIsNightTheme(false)
      }

      typingTimerRef.current = setInterval(() => {
        if (currentLength < targetText.length) {
          currentLength++
          setTypedText(targetText.slice(0, currentLength))
        } else {
          clearInterval(typingTimerRef.current)
        }
      }, 55)
    }

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
    }
  }, [dialogueIndex, step])

  // Handle name submission
  const handleNameNext = () => {
    if (!name.trim()) return
    setStep(1)
    setBubbleText(`À nhonnn bạn ${name} 💜, bạn có nhớ tớ không? Bấm không thử đi 🦆`)
    // Enable music on interaction
    if (!isMusicPlaying) {
      toggleMusic()
    }
  }

  // Handle dodge for "Không" button
  const dodgeButton = () => {
    setDuckState('sad')
    setBubbleText('Tớ giận cậu đấy nhá!! sao cậu lại không nhớ tớ')

    // Find bounds based on viewport to make sure it's reachable and visible
    const isMobile = window.innerWidth <= 600
    const rangeX = isMobile ? 150 : 260
    const rangeY = isMobile ? 110 : 160
    const randomX = Math.floor((Math.random() - 0.5) * rangeX)
    const randomY = Math.floor((Math.random() - 0.5) * rangeY)

    setNoBtnStyle({
      position: 'absolute',
      transform: `translate(${randomX}px, ${randomY}px)`,
      zIndex: 100
    })
  }

  // Handle Yes click
  const handleYesClick = () => {
    setDuckState('happy')
    setBubbleText('Vui quáaa! Vậy cậu cũng sẽ nhớ những thứ này... ✨')
    setStep(2) // Transition state
    setNoBtnStyle({ position: 'relative' })

    // Move to gallery step after a short delay
    setTimeout(() => {
      setStep(3)
    }, 2000)
  }

  // Handle advancing monologue dialogues
  const handleDialogueNext = () => {
    const targetText = dialogues[dialogueIndex]

    // If typewriter is still typing, finish typing immediately
    if (typedText.length < targetText.length) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      setTypedText(targetText)
    } else {
      // Otherwise, advance to next dialogue
      if (dialogueIndex < dialogues.length - 1) {
        setDialogueIndex(prev => prev + 1)
      }
    }
  }

  return (
    <>
      <div id="hidden-player" style={{ display: 'none' }}></div>

      {/* Floating Elements */}
      <div className="floating-hearts">
        {heartsRef.current.map(h => (
          <div
            key={h.id}
            className="heart"
            style={{
              left: `${h.left}%`,
              animationDelay: `${h.delay}s`,
              transform: `rotate(-45deg) scale(${h.scale})`
            }}
          />
        ))}
      </div>

      <div className="floating-stars">
        {starsRef.current.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`
            }}
          />
        ))}
      </div>

      {/* Audio Button */}
      <button className="music-toggle" onClick={toggleMusic} aria-label="Toggle Music">
        <span className={isMusicPlaying ? 'music-icon-playing' : ''} style={{ display: 'inline-block' }}>🎵</span>
        <span>{isMusicPlaying ? 'Tắt Nhạc' : 'Âm nhạc'}</span>
      </button>

      {/* Main card */}
      <div className={`app-container ${step === 4 ? 'swimming-active' : ''}`}>

        {/* Step 0, 1, 2, 3: Speech Bubble */}
        {step < 4 && (
          <div className="bubble-container">
            <div className="speech-bubble">
              <span>{bubbleText}</span>
              {step === 3 && (
                <div className="helper-text" onClick={() => setStep(4)}>
                  Tiếp theo ➔
                </div>
              )}
            </div>
          </div>
        )}

        {/* Polaroid Memory Cards */}
        {(step === 3 || step === 4) && (
          <div className={`gallery-container ${step === 4 ? 'swimming-active' : ''}`}>
            <div className="polaroid-card" style={{ transform: 'rotate(-4deg)' }}>
              <img src="images/z3841200944793_504ddc30c56bc91d51c919fe8d17613b.jpg" className="polaroid-img" alt="Memory 1" />
            </div>
            <div className="polaroid-card" style={{ transform: 'rotate(2deg)' }}>
              <img src="images/z7858652195663_ad05b1b9f45d3924fd19f5ab2b7c33d5.jpg" className="polaroid-img" alt="Memory 2" />
            </div>
            <div className="polaroid-card" style={{ transform: 'rotate(-2deg)' }}>
              <img src="images/z7858654294334_a084d12dd760af24831660c1cd233ca3.jpg" className="polaroid-img" alt="Memory 3" />
            </div>
          </div>
        )}

        {/* Duck Container (Collapsed in step 4) */}
        <div className={`duck-wrapper ${step === 4 ? 'collapsed' : ''}`}>
          <DuckSVG state={duckState} />
        </div>

        {/* Step 0: Name input */}
        {step === 0 && (
          <div>
            <p className="subtitle" style={{ fontWeight: 600, marginBottom: '15px', fontSize: '0.88rem' }}>
              Tớ có một bất ngờ nhỏ, cậu hãy cho tớ biết biệt danh trước nhé!
            </p>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Nhập biệt danh của bạn..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
                aria-label="Biệt danh"
              />
            </div>
            <button className="btn btn-primary" onClick={handleNameNext}>
              Tiếp theo
            </button>
          </div>
        )}

        {/* Step 1: Dodging Yes/No buttons */}
        {step === 1 && (
          <div>
            <div className="buttons-row">
              <button className="btn btn-primary" onClick={handleYesClick}>
                Có chứ!
              </button>
              <button
                className="btn btn-secondary btn-no-dodge"
                style={noBtnStyle}
                onMouseEnter={dodgeButton}
                onTouchStart={dodgeButton}
                onClick={dodgeButton}
              >
                Không...
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Swimming Fixed Duck and Dialogue Typewriter */}
        {step === 4 && (
          <div className="swimming-duck-fixed">
            <div className="speech-bubble" onClick={handleDialogueNext}>
              <span>{typedText}</span>
              <div className="helper-text">
                {dialogueIndex === dialogues.length - 1 && typedText === dialogues[dialogueIndex] ? (
                  <span>Kết thúc ❤️</span>
                ) : (
                  <>
                    <span>Tiếp tục</span>
                    <span>➔</span>
                  </>
                )}
              </div>
            </div>
            <DuckSVG state="swimming" />
          </div>
        )}
      </div>

      {/* Water Floor Waves */}
      <div className={`water-floor-container ${step === 4 ? 'show' : ''}`}>
        <svg className="wave-svg" viewBox="0 0 600 120" preserveAspectRatio="none">
          {/* Back wave */}
          <path className="wave-path-back" fill="#0288d1" opacity="0.5" />
          {/* Front wave */}
          <path className="wave-path" fill="#039be5" />
        </svg>
      </div>
    </>
  )
}

/* Reusable Duck SVG with full emotional states */
function DuckSVG({ state }) {
  const isSad = state === 'sad'
  const isHappy = state === 'happy'
  const isSwimming = state === 'swimming'

  return (
    <svg
      className={`duck-svg ${isSad ? 'duck-sad' : ''}`}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="duckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="100%" stopColor="#fbc02d" />
        </linearGradient>
        <filter id="headShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#f57c00" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Swimming ripples under the duck */}
      {isSwimming && (
        <g>
          <ellipse className="ripple-circle" cx="60" cy="102" rx="40" ry="10" fill="none" strokeWidth="2.5" />
          <ellipse className="ripple-circle ripple-circle-2" cx="60" cy="102" rx="40" ry="10" fill="none" strokeWidth="2.5" />
        </g>
      )}

      {/* Floating shadow when not swimming */}
      {!isSwimming && (
        <ellipse cx="60" cy="103" rx="24" ry="5.5" fill="#000" opacity="0.08" />
      )}

      {/* Duck feet */}
      {!isSwimming && (
        <g fill="#ff9100" stroke="#d84315" strokeWidth="1">
          <ellipse cx="46" cy="98" rx="7" ry="3" />
          <ellipse cx="74" cy="98" rx="7" ry="3" />
        </g>
      )}

      {/* Symmetrical wings */}
      <path
        d="M 36 74 Q 24 78 30 84 Q 40 86 38 76 Z"
        fill="url(#duckGrad)"
        stroke="#f57c00"
        strokeWidth="1.2"
        transform={isSwimming ? 'rotate(-15 36 74)' : ''}
      />
      <path
        d="M 84 74 Q 96 78 90 84 Q 80 86 82 76 Z"
        fill="url(#duckGrad)"
        stroke="#f57c00"
        strokeWidth="1.2"
        transform={isSwimming ? 'rotate(15 84 74)' : ''}
      />

      {/* Duck body */}
      <ellipse cx="60" cy="78" rx="26" ry="20" fill="url(#duckGrad)" stroke="#f57c00" strokeWidth="1.2" />

      {/* Cute pink collar/scarf around the neck */}
      <ellipse cx="60" cy="62" rx="16" ry="3.5" fill="#ff4081" stroke="#c2185b" strokeWidth="1" />
      <circle cx="60" cy="65" r="3" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />

      {/* Duck head with subtle shadow filter to separate from body */}
      <circle cx="60" cy="42" r="24" fill="url(#duckGrad)" stroke="#f57c00" strokeWidth="1.2" filter="url(#headShadow)" />

      {/* Two little cute hairs/feathers on top of the head */}
      <path d="M 57 18 Q 59 10 60 18" stroke="#f57c00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 60 18 Q 62 12 63 18" stroke="#f57c00" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Blushing cheeks */}
      <circle cx="42" cy="47" r="4.5" fill="#ff8a80" opacity="0.8" />
      <circle cx="78" cy="47" r="4.5" fill="#ff8a80" opacity="0.8" />

      {/* Eyes based on states */}
      {isHappy && (
        <g stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round">
          {/* Curved smiling/happy eyes */}
          <path d="M 43 42 Q 48 37 53 42" />
          <path d="M 67 42 Q 72 37 77 42" />
        </g>
      )}

      {isSad && (
        <>
          <g stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round">
            {/* Sad crying eyes */}
            <path d="M 43 39 Q 48 44 53 39" />
            <path d="M 67 39 Q 72 44 77 39" />
          </g>
          {/* Crying tears */}
          <path
            className="tear"
            d="M 46 46 C 44 48 42 51 42 54 C 42 56 44 58 46 58 C 48 58 50 56 50 54 C 50 51 48 48 46 46 Z"
            fill="#29b6f6"
          />
          <path
            className="tear tear-right"
            d="M 74 46 C 72 48 70 51 70 54 C 70 56 72 58 74 58 C 76 58 78 56 78 54 C 78 51 76 48 74 46 Z"
            fill="#29b6f6"
          />
        </>
      )}

      {!isHappy && !isSad && (
        <g fill="#000">
          {/* Normal circular eyes */}
          <circle cx="48" cy="40" r="3.2" />
          <circle cx="72" cy="40" r="3.2" />
          {/* Cute white highlights */}
          <circle cx="49" cy="38.8" r="1.1" fill="#fff" />
          <circle cx="73" cy="38.8" r="1.1" fill="#fff" />
        </g>
      )}

      {/* Beak */}
      <path
        d={isSad ? "M 53 47 Q 60 41 67 47 Q 60 45 53 47 Z" : "M 52 44 Q 60 51 68 44 Q 60 46 52 44 Z"}
        fill="#ff9100"
        stroke="#e65100"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default App
