'use client'
// components/shared/DogLoader.tsx
// Mascota animada (perrito cómic SVG) para estados de carga.
//
// Props:
//   visible  — mostrar/ocultar el loader
//   message  — texto en la burbuja (ej. "Cargando tus gastos...")
//   status   — 'loading' | 'success' | 'error'
//             'loading' → loop de animaciones
//             'success' → animación de moneditas y se oculta automáticamente
//             'error'   → mensaje de error, sin moneditas
//   size     — 'sm' (120px) | 'md' (180px) | 'lg' (240px)
//   overlay  — si true, se muestra como overlay semitransparente sobre el contenido

import { useEffect, useState } from 'react'

type LoaderStatus = 'loading' | 'success' | 'error'
type LoaderSize = 'sm' | 'md' | 'lg'

interface DogLoaderProps {
  visible: boolean
  message?: string
  status?: LoaderStatus
  size?: LoaderSize
  overlay?: boolean
  /** Llamado cuando la animación de éxito termina y el componente se oculta */
  onDone?: () => void
}

const SIZE_MAP: Record<LoaderSize, number> = {
  sm: 120,
  md: 180,
  lg: 240,
}

// Partículas de éxito (moneditas / destellos)
const SUCCESS_PARTICLES = ['💰', '✨', '💰', '✨', '💰']

export function DogLoader({
  visible,
  message,
  status = 'loading',
  size = 'md',
  overlay = false,
  onDone,
}: DogLoaderProps) {
  const [internalVisible, setInternalVisible] = useState(visible)
  const [showParticles, setShowParticles] = useState(false)

  const svgSize = SIZE_MAP[size]

  // Manejar ciclo de vida: loading → success → ocultar
  useEffect(() => {
    if (visible) {
      setInternalVisible(true)
    }
    if (status === 'success' && visible) {
      setShowParticles(true)
      const t = setTimeout(() => {
        setInternalVisible(false)
        setShowParticles(false)
        onDone?.()
      }, 1800)
      return () => clearTimeout(t)
    } else if (!visible) {
      // Si se oculta desde afuera sin pasar por success
      const t = setTimeout(() => setInternalVisible(false), 200)
      return () => clearTimeout(t)
    }
  }, [visible, status, onDone])

  if (!internalVisible) return null

  const isSuccess = status === 'success'
  const isError = status === 'error'

  const defaultMessages: Record<LoaderStatus, string> = {
    loading: 'Cargando...',
    success: '¡Listo!',
    error: 'Ups, algo salió mal',
  }

  const displayMessage = message ?? defaultMessages[status]

  const bubbleColor = isError
    ? 'var(--negative)'
    : isSuccess
    ? 'var(--positive)'
    : 'var(--accent)'

  return (
    <>
      {/* Estilos de animación en <style> para evitar dependencias externas */}
      <style>{`
        /* ──────── Dog Loader Keyframes ──────── */

        /* Rebote suave del cuerpo entero */
        @keyframes dl-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }

        /* Wag de la cola */
        @keyframes dl-wag {
          0%   { transform: rotate(-18deg); transform-origin: 146px 100px; }
          50%  { transform: rotate(14deg);  transform-origin: 146px 100px; }
          100% { transform: rotate(-18deg); transform-origin: 146px 100px; }
        }

        /* Balanceo oreja izquierda */
        @keyframes dl-earL {
          0%, 100% { transform: rotate(0deg);   transform-origin: 42px 46px; }
          50%       { transform: rotate(-9deg);  transform-origin: 42px 46px; }
        }

        /* Balanceo oreja derecha */
        @keyframes dl-earR {
          0%, 100% { transform: rotate(0deg);  transform-origin: 141px 44px; }
          50%       { transform: rotate(9deg); transform-origin: 141px 44px; }
        }

        /* Parpadeo periódico de los ojos (cerrar = escalar Y a 0) */
        @keyframes dl-blink {
          0%, 93%, 100% { transform: scaleY(1); }
          95%, 98%      { transform: scaleY(0.06); }
        }

        /* Burbuja emergiendo */
        @keyframes dl-bubble {
          0%   { opacity: 0; transform: scale(0.7) translateY(6px); }
          15%  { opacity: 1; transform: scale(1.05) translateY(0); }
          25%  { transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* Partícula de éxito flotando */
        @keyframes dl-particle {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-54px) scale(0.6); }
        }

        /* Fade-in del overlay */
        @keyframes dl-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ──────── Clases de animación ──────── */

        /* Respeta prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .dl-body, .dl-tail, .dl-earL, .dl-earR, .dl-eyes, .dl-bubble { animation: none !important; }
        }

        .dl-body {
          animation: dl-bob 1.5s ease-in-out infinite;
        }
        .dl-tail {
          animation: dl-wag 0.7s ease-in-out infinite;
        }
        .dl-earL {
          animation: dl-earL 2.1s ease-in-out infinite;
        }
        .dl-earR {
          animation: dl-earR 2.1s ease-in-out infinite 0.35s;
        }
        .dl-eyes {
          animation: dl-blink 4s ease-in-out infinite 1.2s;
          transform-origin: 91px 55px;
        }
        .dl-bubble {
          animation: dl-bubble 0.35s ease-out both;
        }
        .dl-particle {
          animation: dl-particle 1.6s ease-out both;
        }
      `}</style>

      {/* Contenedor: overlay o inline */}
      <div
        role="status"
        aria-live="polite"
        aria-label={displayMessage}
        style={{
          ...(overlay
            ? {
                position: 'fixed',
                inset: 0,
                zIndex: 9000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(3px)',
                animation: 'dl-fadeIn 0.2s ease',
              }
            : {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1rem',
              }),
        }}
      >
        {/* Wrapper con fondo si es overlay */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'relative',
            ...(overlay && {
              background: 'var(--surface)',
              borderRadius: 'var(--radius-2xl)',
              padding: '2rem 2.5rem',
              boxShadow: 'var(--shadow-xl)',
            }),
          }}
        >
          {/* Burbuja de mensaje — encima del perro */}
          {displayMessage && (
            <div
              className="dl-bubble"
              style={{
                position: 'relative',
                background: bubbleColor,
                color: 'white',
                padding: '0.4rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                marginBottom: '0.25rem',
              }}
            >
              {displayMessage}
              {/* Cola de la burbuja */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `10px solid ${bubbleColor}`,
                }}
              />
            </div>
          )}

          {/* SVG del perrito */}
          <div
            className="dl-body"
            style={{ position: 'relative', width: svgSize, height: svgSize * 0.79 }}
          >
            <svg
              viewBox="0 0 190 150"
              xmlns="http://www.w3.org/2000/svg"
              width={svgSize}
              height={svgSize * 0.79}
              aria-hidden="true"
            >
              {/* Sombra del suelo */}
              <ellipse cx="94" cy="138" rx="58" ry="5" fill="#000" opacity="0.06" />

              {/* Cola (animada) */}
              <g className="dl-tail">
                <path
                  d="M146 100 C 168 92, 176 68, 160 54 C 156 66, 158 84, 146 96 Z"
                  fill="#F1EEE6"
                  stroke="#232323"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </g>

              {/* Cuerpo */}
              <path
                d="M50 78 C 34 82, 28 112, 46 128 C 66 140, 122 140, 142 128 C 160 112, 154 82, 138 78 C 138 78, 94 70, 50 78 Z"
                fill="#F1EEE6"
                stroke="#232323"
                strokeWidth="3.5"
              />

              {/* Oreja derecha (animada) */}
              <g className="dl-earR">
                <path
                  d="M128 40 C 146 30, 160 40, 154 62 C 150 76, 132 74, 126 60 Z"
                  fill="#232323"
                />
              </g>

              {/* Cabeza */}
              <circle cx="94" cy="58" r="46" fill="#F1EEE6" stroke="#232323" strokeWidth="3.5" />

              {/* Oreja izquierda (animada) */}
              <g className="dl-earL">
                <path
                  d="M58 38 C 38 26, 22 34, 26 58 C 30 74, 50 74, 58 58 Z"
                  fill="#232323"
                />
              </g>

              {/* Manchón oscuro cabeza */}
              <path
                d="M108 30 C 128 26, 138 42, 130 58 C 122 70, 104 66, 100 50 C 98 40, 100 34, 108 30 Z"
                fill="#232323"
              />

              {/* Mejillas doradas */}
              <ellipse cx="68" cy="70" rx="8" ry="5" fill="#E8B34E" opacity="0.35" />
              <ellipse cx="118" cy="70" rx="8" ry="5" fill="#E8B34E" opacity="0.35" />

              {/* Ojos (parpadeantes) */}
              <g className="dl-eyes">
                <circle cx="76" cy="56" r="5.5" fill="#232323" />
                <circle cx="106" cy="54" r="5.5" fill="#232323" />
                <circle cx="78" cy="54" r="1.6" fill="#fff" />
                <circle cx="108" cy="52" r="1.6" fill="#fff" />
              </g>

              {/* Nariz */}
              <ellipse cx="92" cy="72" rx="7" ry="5" fill="#232323" />

              {/* Boca */}
              <path
                d="M92 77 C 92 84, 84 88, 76 84"
                stroke="#232323"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M92 77 C 92 84, 100 88, 108 84"
                stroke="#232323"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />

              {/* Patitas */}
              <ellipse cx="66" cy="130" rx="11" ry="8" fill="#F1EEE6" stroke="#232323" strokeWidth="3" />
              <ellipse cx="120" cy="130" rx="11" ry="8" fill="#F1EEE6" stroke="#232323" strokeWidth="3" />

              {/* Collar dorado */}
              <path
                d="M58 92 C 78 100, 112 100, 130 92"
                stroke="#E8B34E"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              {/* Etiqueta del collar */}
              <circle cx="94" cy="99" r="4" fill="#E8B34E" stroke="#232323" strokeWidth="1.5" />
            </svg>

            {/* Partículas de éxito */}
            {showParticles &&
              SUCCESS_PARTICLES.map((emoji, i) => (
                <span
                  key={i}
                  className="dl-particle"
                  style={{
                    position: 'absolute',
                    fontSize: `${14 + (i % 3) * 3}px`,
                    left: `${15 + i * 17}%`,
                    bottom: '60%',
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: `${1.2 + i * 0.1}s`,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {emoji}
                </span>
              ))}
          </div>

          {/* Screen-reader text */}
          <span className="sr-only">{displayMessage}</span>
        </div>
      </div>
    </>
  )
}

// ─── Variante de pantalla completa de carga inicial ────────────────────────
// Útil para la primera carga del dashboard cuando no hay nada que mostrar aún.

export function FullPageLoader({ message = 'Cargando tus finanzas...' }: { message?: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        flexDirection: 'column',
        gap: '1rem',
      }}
      role="status"
      aria-label={message}
    >
      <DogLoader visible status="loading" message={message} size="lg" />
    </div>
  )
}

// ─── Variante inline pequeña (reemplaza spinners en tarjetas) ─────────────

export function InlineDogLoader({ message }: { message?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        gap: '0.5rem',
      }}
    >
      <DogLoader visible status="loading" message={message} size="sm" />
    </div>
  )
}
