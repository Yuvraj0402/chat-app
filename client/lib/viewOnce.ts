import { api } from './api'

export async function markMessageViewed(messageId: string, userId: string): Promise<boolean> {
    try {
        await api.post(`/messages/${messageId}/mark-viewed`, { userId })
        return true
    } catch (error) {
        console.error('Error marking message as viewed:', error)
        return false
    }
}
