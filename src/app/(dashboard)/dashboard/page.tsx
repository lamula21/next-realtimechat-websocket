import { getFriendsByUserId } from '@/actions/get-friends'
import { fetchRedis } from '@/actions/redis'
import { authOptions } from '@/lib/auth'
import { chatHrefConstructor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function DashBoardPage() {
	const session = await getServerSession(authOptions)

	if (!session) notFound()

	const friends = await getFriendsByUserId(session.user.id)

	const friendsWithLastMessage = await Promise.all(
		friends.map(async (friend) => {
			const [lastMessageRaw] = (await fetchRedis(
				'zrange',
				`chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
				-1,
				-1
			)) as string[]

			if (!lastMessageRaw) return { ...friend, lastMessage: '' }

			// Parse UTF-8 string to JSON
			const lastMessage = JSON.parse(lastMessageRaw) as Message

			return {
				...friend,
				lastMessage,
			}
		})
	)

	return (
		<main className="container py-12">
			<h1 className="font-bold text-5xl mb-8">Recent chats</h1>

			{friendsWithLastMessage.length === 0 ? (
				<p className="text-sm text-zinc-500">Nothing to show here</p>
			) : (
				friendsWithLastMessage.map((friend) => (
					<div
						key={friend.id}
						className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
					>
						<div className="absolute right-4 inset-y-0 flex items-center">
							<ChevronRight className="h-7 w-7 text-zinc-400" />
						</div>

						<Link
							href={`/dashboard/chat/${chatHrefConstructor(
								session.user.id,
								friend.id
							)}`}
							className="relative sm:flex"
						>
							<div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
								<div className="relative h-6 w-6">
									<Image
										fill
										alt={`${friend.name}`}
										referrerPolicy="no-referrer"
										src={friend.image}
									/>
								</div>
							</div>

							<div>
								<h4 className="text-lg font-semibold">{friend.name}</h4>
								<p className="mt-1 max-w-md">
									<span className="text-zinc-400">
										{friend.lastMessage?.senderId === session.user.id
											? 'You: '
											: `${friend.name}: `}

										{friend.lastMessage.text}
									</span>
								</p>
							</div>
						</Link>
					</div>
				))
			)}
		</main>
	)
}
