import { fetchRedis } from '@/actions/redis'

export async function getUnseenRequestCount(sessionId: string) {
	const unseenRequestCount = (
		(await fetchRedis(
			'smembers',
			`user:${sessionId}:incoming_friend_requests`
		)) as User[]
	).length

	return unseenRequestCount
}
