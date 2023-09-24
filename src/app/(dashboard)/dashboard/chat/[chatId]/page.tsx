import { fetchRedis } from '@/actions/redis'
import ChatInput from '@/components/chat-input'
import Messages from '@/components/messages'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArraySchema } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface PageProps {
	params: {
		chatId: string
	}
}

async function getChatMessages(chatId: string) {
	try {
		// fetch all messages from redis from 0 to end
		const results: string[] = await fetchRedis(
			'zrange',
			`chat:${chatId}:messages`,
			0,
			-1
		)

		const dbMessages = results.map((message) => JSON.parse(message) as Message)

		const reversedMessages = dbMessages.reverse()

		// validate with zod
		const messages = messageArraySchema.parse(reversedMessages)

		return messages
	} catch (error) {
		notFound()
	}
}

export default async function ChatPage({ params }: PageProps) {
	const { chatId } = params
	const session = await getServerSession(authOptions)

	if (!session) {
		notFound()
	}

	const { user } = session

	// url: /chat/userid1--userid2
	const [userId1, userId2] = chatId.split('--')

	if (user.id !== userId1 && user.id !== userId2) {
		notFound()
	}

	const chatPartnerId = user.id === userId1 ? userId2 : userId1
	const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User
	const initialMessages = await getChatMessages(chatId)

	return (
		<main className="flex flex-col flex-1 justify-between">
			<div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 ">
				<div className="relative flex items-center space-x-4">
					<div className="relative">
						<div className="relative w-8 sm:w-12 h-8 sm:h-12">
							<Image
								fill
								referrerPolicy="no-referrer"
								src={chatPartner.image}
								alt={`${chatPartner.name} profile picture
							`}
								className="rounded-full"
							/>
						</div>
					</div>

					<div className="flex flex-col leading-tight">
						<div className="text-xl flex items-center">
							<span className="text-gray-700 mr-3 font-semibold">
								{chatPartner.name}
							</span>
						</div>

						<span className="text-sm text-gray-600">{chatPartner.email}</span>
					</div>
				</div>
			</div>

			<Messages
				chatId={chatId}
				initialMessages={initialMessages}
				sessionId={session.user.id}
				chatPartner={chatPartner}
				sessionImg={session.user.image}
			/>

			<ChatInput chatParner={chatPartner} chatId={chatId} />
		</main>
	)
}
