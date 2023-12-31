'use client'
import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { UnseenChatToast } from './UnseenChatToast'

interface ChatListProps {
	friends: User[]
	sessionId: string
}

interface ExtendedMessage extends Message {
	senderImg: string
	senderName: string
}

export default function ChatList({ friends, sessionId }: ChatListProps) {
	const router = useRouter()
	const pathname = usePathname()

	const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
	const [activeChats, setActiveChats] = useState<User[]>(friends)

	useEffect(() => {
		pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
		pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

		// refreshes the page when friend accepts request
		const newFriendHandler = (newFriend: User) => {
			setActiveChats((prev) => [...prev, newFriend])
		}

		// Notify user with toast
		const chatHandler = (message: ExtendedMessage) => {
			const shouldNotify =
				pathname !==
				`/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

			if (!shouldNotify) return

			// should be notified
			toast.custom((t) => (
				<UnseenChatToast
					t={t}
					sessionId={sessionId}
					senderId={message.senderId}
					senderImg={message.senderImg}
					senderMessage={message.text}
					senderName={message.senderName}
				/>
			))

			setUnseenMessages((prev) => [...prev, message])
		}

		pusherClient.bind('new_message', chatHandler)
		pusherClient.bind('new_friend', newFriendHandler)

		return () => {
			pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
			pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

			pusherClient.unbind('new_message', chatHandler)
			pusherClient.unbind('new_friend', newFriendHandler)
		}
	}, [pathname, sessionId, router])

	// remove unseen messages from list when user is in chat
	useEffect(() => {
		if (pathname?.includes('chat')) {
			setUnseenMessages((prev) => {
				return prev.filter((msg) => !pathname.includes(msg.senderId))
			})
		}
	}, [pathname])

	return (
		<ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
			{activeChats.sort().map((friend) => {
				const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
					return unseenMsg.senderId === friend.id
				}).length

				return (
					<li key={friend.id}>
						<a
							href={`/dashboard/chat/${chatHrefConstructor(
								sessionId,
								friend.id
							)}`}
							className="text-gray-700 hover:text-red-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
						>
							{friend.name}
							{unseenMessagesCount > 0 ? (
								<div className="bg-red-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
									{unseenMessagesCount}
								</div>
							) : null}
						</a>
					</li>
				)
			})}
		</ul>
	)
}
