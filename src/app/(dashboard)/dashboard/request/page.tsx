import { FriendRequestLists } from '@/components/friend-requests-list'
import { fetchRedis } from '@/actions/redis'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'

export default async function RequestPage() {
	const session = await getServerSession(authOptions)
	if (!session) notFound()

	const incomingSenderIds = (await fetchRedis(
		'smembers',
		`user:${session.user.id}:incoming_friend_requests`
	)) as string[]

	const incomingFriendrequest = await Promise.all(
		incomingSenderIds.map(async (senderId) => {
			const sender = (await fetchRedis('get', `user:${senderId}`)) as string
			const senderParsed = JSON.parse(sender) as User
			return {
				senderId,
				senderEmail: senderParsed.email,
			}
		})
	)

	return (
		<main className="p-10">
			<h1 className="font-bold text-5xl mb-8">Add a friend</h1>
			<div className="flex flex-col gap-4">
				<FriendRequestLists
					incomingFriendRequests={incomingFriendrequest}
					sessionId={session.user.id}
				/>
			</div>
		</main>
	)
}
