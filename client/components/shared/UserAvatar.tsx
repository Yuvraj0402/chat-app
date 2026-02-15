import { getInitials } from '@/lib/utils'
import Image from 'next/image'
import { BASE_URL } from '@/lib/api'

interface UserAvatarProps {
    user: {
        username: string
        avatarImage?: string
        _id?: string
        id?: string
    }
    className?: string
    showOnlineStatus?: boolean
    isOnline?: boolean
}

export default function UserAvatar({
    user,
    className = "w-10 h-10",
    showOnlineStatus = false,
    isOnline = false
}: UserAvatarProps) {

    // Clean up BASE_URL handling. If avatarImage is a full URL, use it.
    // If it's a relative path (e.g., /api/files/...), prepend BASE_URL if needed, 
    // but usually standard img src works with relative if on same domain.
    // However, api.ts says BASE_URL = https://chat-app-7hcf.onrender.com. 
    // If `avatarImage` coming from backend is `/api/files/xyz`, we might need full URL if frontend is on 3000.

    const getAvatarUrl = (path: string) => {
        if (path.startsWith('http')) return path
        // Remove leading slash if BASE_URL ends with one, or vice versa, to avoid double slashes
        // But api.ts BASE_URL is 'https://chat-app-7hcf.onrender.com' (no trailing slash).
        if (path.startsWith('/')) return `${BASE_URL}${path}`
        return `${BASE_URL}/${path}`
    }

    return (
        <div className={`relative inline-block ${className}`}>
            {user.avatarImage ? (
                <img
                    src={getAvatarUrl(user.avatarImage)}
                    alt={user.username}
                    className={`w-full h-full rounded-full object-cover shadow-sm border border-slate-100 ${className}`}
                />
            ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-semibold shadow-sm bg-gradient-to-br from-emerald-400 to-emerald-600 ${className}`}>
                    {getInitials(user.username)}
                </div>
            )}

            {showOnlineStatus && (
                <span className={`absolute bottom-0 right-0 block w-[25%] h-[25%] rounded-full ring-2 ring-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            )}
        </div>
    )
}
