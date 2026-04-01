'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { type Locale } from '@/i18n/routing'
import ConfirmDialog from './ConfirmDialog'
import { AppIcon } from '@/components/ui/icons'
import { usePathname, useRouter } from '@/i18n/navigation'

const LANGUAGE_LABELS: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
}

const SWITCH_CONFIRM_COPY: Record<Locale, { title: string; message: string; action: string; cancel: string; triggerLabel: string }> = {
    tr: {
        title: 'Dil değiştirilsin mi?',
        message:
            '{targetLanguage} diline geçiş yapıldığında, yalnızca arayüz metinleri değil, tüm süreçteki prompt şablonları, senaryo üretimi ve görev çıktı dili de değişecektir. Devam edilsin mi?',
        action: 'Değiştir',
        cancel: 'İptal',
        triggerLabel: 'Dil değiştir',
    },
    en: {
        title: 'Switch language?',
        message:
            'Switching to {targetLanguage} will update not only interface text, but also end-to-end prompt templates, script generation, and workflow output language. Continue?',
        action: 'Switch now',
        cancel: 'Cancel',
        triggerLabel: 'Switch language',
    },
}

function isSupportedLocale(locale?: string): locale is Locale {
    return locale === 'tr' || locale === 'en'
}

export default function LanguageSwitcher() {
    const router = useRouter()
    const pathname = usePathname()
    const locale = useLocale()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [pendingLocale, setPendingLocale] = useState<Locale | null>(null)

    if (!isSupportedLocale(locale)) {
        throw new Error('LanguageSwitcher requires locale to be tr or en')
    }
    const currentLocale: Locale = locale
    const targetLocale: Locale = currentLocale === 'tr' ? 'en' : 'tr'
    const activeLocaleForCopy: Locale = pendingLocale ?? targetLocale
    const confirmCopy = SWITCH_CONFIRM_COPY[activeLocaleForCopy]

    useEffect(() => {
        if (!isMenuOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMenuOpen])

    const requestLanguageSwitch = (newLocale: Locale) => {
        setIsMenuOpen(false)
        if (newLocale === currentLocale) return
        setPendingLocale(newLocale)
        setShowConfirm(true)
    }

    const confirmLanguageSwitch = () => {
        if (!pendingLocale) {
            throw new Error('LanguageSwitcher confirm requires a pending locale')
        }
        setShowConfirm(false)
        setPendingLocale(null)
        router.replace(pathname, { locale: pendingLocale })
    }

    const cancelLanguageSwitch = () => {
        setShowConfirm(false)
        setPendingLocale(null)
    }

    return (
        <>
            <div ref={containerRef} className="relative inline-block">
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    aria-label={SWITCH_CONFIRM_COPY[targetLocale].triggerLabel}
                    aria-expanded={isMenuOpen}
                    className="glass-btn-base glass-btn-secondary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                >
                    <AppIcon name="globe" className="h-4 w-4" />
                    <span>{LANGUAGE_LABELS[currentLocale]}</span>
                    <AppIcon name="chevronDown" className="h-4 w-4 text-[var(--glass-text-tertiary)]" />
                </button>

                {isMenuOpen ? (
                    <div className="glass-surface-modal absolute right-0 z-50 mt-2 w-44 rounded-xl p-2">
                        {(Object.entries(LANGUAGE_LABELS) as Array<[Locale, string]>).map(([locale, label]) => {
                            const isActive = locale === currentLocale
                            return (
                                <button
                                    key={locale}
                                    type="button"
                                    onClick={() => requestLanguageSwitch(locale)}
                                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${isActive
                                        ? 'bg-[var(--glass-fill-active)] text-[var(--glass-text-primary)]'
                                        : 'text-[var(--glass-text-secondary)] hover:bg-[var(--glass-fill-hover)] hover:text-[var(--glass-text-primary)]'
                                        }`}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                ) : null}
            </div>
            <ConfirmDialog
                show={showConfirm}
                title={confirmCopy.title}
                message={confirmCopy.message.replace('{targetLanguage}', pendingLocale ? LANGUAGE_LABELS[pendingLocale] : '')}
                confirmText={confirmCopy.action}
                cancelText={confirmCopy.cancel}
                onConfirm={confirmLanguageSwitch}
                onCancel={cancelLanguageSwitch}
                type="info"
            />
        </>
    )
}
