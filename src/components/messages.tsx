'use client'
import { cn, toPusherKey } from '@/lib/utils'
import { Message } from '@/lib/validations/message'
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import { pusherClient } from '@/lib/pusher'

interface MessagesProps {
	initialMessages: Message[]
	sessionId: string
	sessionImg: string | undefined | null
	chatPartner: User
	chatId: string
}

export default function Messages({
	initialMessages,
	sessionId,
	sessionImg,
	chatPartner,
	chatId,
}: MessagesProps) {
	const [messages, setMessages] = useState<Message[]>(initialMessages)

	const scrollDownRef = useRef<HTMLDivElement | null>(null)

	const formatTimeStamp = (timestamp: number) => {
		return format(timestamp, 'HH:mm')
	}

	// pusher client to subscribe incoming friend request
	useEffect(() => {
		pusherClient.subscribe(toPusherKey(`chat:${chatId}`))

		const messageHandler = (message: Message) => {
			setMessages((prev) => [message, ...prev])
		}

		pusherClient.bind('incoming_message', messageHandler)

		return () => {
			pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))

			pusherClient.unbind('incoming_message', messageHandler)
		}
	}, [chatId])

	return (
		<div
			id="messages"
			className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scroll-thumb-blue scrollbar-thumb-rounded scroll-track-blue-lighter scrollbar-w-2 scrolling-touch "
		>
			{/* // automatically scroll down to new message */}
			<div ref={scrollDownRef} />

			{messages.map((message, index) => {
				const isCurrentUser = message.senderId === sessionId

				const hasNextMessageFromSameUser =
					messages[index - 1]?.senderId === messages[index].senderId

				return (
					<div key={`${message.id}-${message.timestamp}}`}>
						<div
							className={cn('flex items-end', isCurrentUser && 'justify-end')}
						>
							<div
								className={cn(
									'flex flex-col space-y-2 text-base max-w-xs mx-2',
									isCurrentUser && 'order-1 items-end',
									!isCurrentUser && 'order-2 items-start'
								)}
							>
								<span
									className={cn(
										'px-4 py-2 rounded-lg inline-block',
										isCurrentUser && 'bg-indigo-600 text-white',
										!isCurrentUser && 'bg-gray-200 text-gray-900',
										!hasNextMessageFromSameUser &&
											isCurrentUser &&
											'rounded-br-none',
										!hasNextMessageFromSameUser &&
											!isCurrentUser &&
											'rounded-bl-none'
									)}
								>
									{message.text}{' '}
									<span className="ml-2 text-xs text-gray-400">
										{formatTimeStamp(message.timestamp)}
									</span>
								</span>
							</div>
							<div
								className={cn(
									'relative w-6 h-6',
									isCurrentUser && 'order-2',
									!isCurrentUser && 'order-1',
									hasNextMessageFromSameUser && 'invisible'
								)}
							>
								<Image
									fill
									alt="profile picture"
									referrerPolicy="no-referrer"
									src={
										isCurrentUser ? (sessionImg as string) : chatPartner.image
									}
									className="rounded-full"
								/>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
