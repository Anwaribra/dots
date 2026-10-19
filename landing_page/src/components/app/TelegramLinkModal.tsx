import React, { useState } from 'react'
import { Send, X, Check, AlertCircle, ArrowRight, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface TelegramLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TelegramLinkModal: React.FC<TelegramLinkModalProps> = ({ isOpen, onClose }) => {
  const { user, claimTelegramAccount } = useAuth()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsSubmitting(true)
    setResultMsg(null)

    const res = await claimTelegramAccount(code.trim())
    setIsSubmitting(false)

    if (res.success) {
      setResultMsg({ type: 'success', text: res.message })
      setTimeout(() => {
        onClose()
      }, 1200)
    } else {
      setResultMsg({ type: 'error', text: res.message })
    }
  }

  return (
    <div className="link-modal-overlay" onClick={onClose}>
      <div className="link-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="link-modal-header">
          <div className="modal-title-lockup">
            <div className="tg-avatar-circle">
              <Send size={18} />
            </div>
            <div>
              <h3>Connect Telegram Bot</h3>
              <p>Sync tasks & schedule proposals with @DotsPersonalPlannerBot</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {!user ? (
          /* Not Signed In Guard */
          <div style={{ padding: '8px 0' }}>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.22)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '18px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#111827', fontSize: '0.94rem', marginBottom: '4px' }}>
                  Sign in required before linking
                </strong>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.5 }}>
                  You are currently viewing the app as a guest. To link your Telegram tasks and schedule proposals to your private Dots dashboard, please sign in or create an account first.
                </p>
              </div>
            </div>

            <a
              href="#signin"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: '#2B2FD9',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.90rem',
                padding: '12px 20px',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(43, 47, 217, 0.25)',
              }}
            >
              <span>Sign In / Create Account</span>
              <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          /* Signed In View */
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.80rem',
                color: '#4B5563',
                background: '#F3F4F6',
                padding: '6px 12px',
                borderRadius: '8px',
                marginBottom: '14px',
              }}
            >
              <UserCheck size={14} color="#059669" />
              <span>
                Linking account to: <strong>{user.email}</strong>
              </span>
            </div>

            <div className="link-instructions-box">
              <ol className="instructions-list">
                <li>
                  Open Telegram and send <code>/link</code> to{' '}
                  <a
                    href="https://t.me/DotsPersonalPlannerBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tg-bot-link"
                  >
                    @DotsPersonalPlannerBot
                  </a>
                </li>
                <li>The bot will immediately send you a 6-digit link code.</li>
                <li>Enter the 6-digit code below to link your web account.</li>
              </ol>
            </div>

            <form onSubmit={handleSubmit} className="link-form">
              <label htmlFor="link-code" className="form-label">
                Enter 6-Digit Link Code
              </label>
              <div className="input-group">
                <input
                  id="link-code"
                  type="text"
                  placeholder="e.g. 582914"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="code-input"
                  maxLength={6}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim()}
                  className="link-submit-btn"
                >
                  {isSubmitting ? 'Linking...' : 'Connect'}
                </button>
              </div>

              {resultMsg && (
                <div className={`link-feedback-msg ${resultMsg.type}`}>
                  {resultMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{resultMsg.text}</span>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
