'use client'

import { useState, useEffect, useRef } from 'react'
import { Message } from '@/lib/messages'
import { markMessageViewed } from '@/lib/viewOnce'
import { BASE_URL } from '@/lib/api'

interface ViewOnceImageProps {
    message: Message
    currentUserId: string
    isOwn: boolean
}

export default function ViewOnceImage({ message, currentUserId, isOwn }: ViewOnceImageProps) {
    const [isViewing, setIsViewing] = useState(false)
    const [isExpired, setIsExpired] = useState(message.isExpired || false)
    const [showWarning, setShowWarning] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)

    // Check if already viewed by current user
    const hasViewed = message.viewedBy?.some(v => v.user === currentUserId) || message.isExpired

    useEffect(() => {
        if (hasViewed) {
            setIsExpired(true)
        }
    }, [hasViewed])

    const handleView = async () => {
        if (isExpired || hasViewed) return

        setIsViewing(true)

        // Mark as viewed in backend after 2 seconds
        if (!isOwn) {
            setTimeout(async () => {
                const success = await markMessageViewed(message._id || message.id || '', currentUserId)
                if (success) {
                    setIsExpired(true)
                    setIsViewing(false)
                }
            }, 2000) // 2 second delay
        } else {
            // For own messages, just close after 2 seconds
            setTimeout(() => {
                setIsViewing(false)
            }, 2000)
        }
    }

    const handleClose = () => {
        setIsViewing(false)
    }

    // Screenshot prevention and window blur detection
    useEffect(() => {
        if (!isViewing) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Windows Snipping Tool: Win+Shift+S
            const isWindowsSnippingTool = (
                e.shiftKey &&
                (e.metaKey || e.key === 'Meta') &&
                e.key.toLowerCase() === 's'
            )

            // Print Screen variations
            const isPrintScreen = (
                e.key === 'PrintScreen' ||
                (e.ctrlKey && e.key === 'PrintScreen')
            )

            // Mac screenshots: Cmd+Shift+3/4/5
            const isMacScreenshot = (
                e.metaKey &&
                e.shiftKey &&
                ['3', '4', '5'].includes(e.key)
            )

            // Block all screenshot attempts
            if (isWindowsSnippingTool || isPrintScreen || isMacScreenshot) {
                e.preventDefault()
                setShowWarning(true)
                setTimeout(() => setShowWarning(false), 3000)
            }
        }

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
        }

        // Detect window blur (happens when Snipping Tool or other apps open)
        const handleBlur = () => {
            setIsViewing(false)
            setShowWarning(true)
            setTimeout(() => setShowWarning(false), 3000)
        }

        // Detect visibility change (tab switching, minimizing)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsViewing(false)
                setShowWarning(true)
                setTimeout(() => setShowWarning(false), 3000)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('contextmenu', handleContextMenu)
        window.addEventListener('blur', handleBlur)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('contextmenu', handleContextMenu)
            window.removeEventListener('blur', handleBlur)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [isViewing])

    const getImageUrl = (url: string) => {
        if (!url) return ''
        return url.startsWith('http') ? url : `${BASE_URL}${url}`
    }

    if (isExpired && !isOwn) {
        return (
            <div className="flex items-center gap-2 py-3 px-4 opacity-60">
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Photo expired</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">View once photo</p>
                </div>
            </div>
        )
    }

    // For sender's own view once photos - show sent indicator
    if (isOwn) {
        return (
            <div className="w-48 flex items-center gap-3 py-2">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">📷</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Photo</p>
                    <p className="text-xs text-white/80">View once</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Preview */}
            <div
                onClick={handleView}
                className="relative cursor-pointer group"
            >
                <div className="w-64 h-64 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                    {/* Blurred preview */}
                    <img
                        src={getImageUrl(message.fileData?.url || '')}
                        alt="View once photo"
                        className="w-full h-full object-cover blur-2xl scale-110"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                            <span className="text-4xl">👁️</span>
                        </div>
                        <p className="text-white font-semibold text-base">View once</p>
                        <p className="text-white/90 text-sm mt-1">Tap to open</p>
                    </div>
                </div>
            </div>

            {/* Full view modal */}
            {isViewing && (
                <div
                    ref={modalRef}
                    className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                    onClick={handleClose}
                    style={{ userSelect: 'none' }}
                >
                    {/* Warning banner */}
                    {showWarning && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-10 animate-in fade-in slide-in-from-top-2">
                            ⚠️ Screenshots are disabled
                        </div>
                    )}

                    {/* Image */}
                    <img
                        src={getImageUrl(message.fileData?.url || '')}
                        alt="View once photo"
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        style={{
                            userSelect: 'none',
                            pointerEvents: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                    />

                    {/* Watermark */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                        View once • Screenshot blocked
                    </div>
                </div>
            )}
        </>
    )
}
