'use client'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FriendRequestProps {
	sessionId: string
	initialUnseenRequestCount: number
}

export function FriendRequest({
	sessionId,
	initialUnseenRequestCount,
}: FriendRequestProps) {
	const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
		initialUnseenRequestCount
	)

	// pusher client to subscribe incoming friend request
	useEffect(() => {
		pusherClient.subscribe(
			toPusherKey(`user:${sessionId}:incoming_friend_requests`)
		)

		pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

		const friendRequestHandler = () => {
			setUnseenRequestCount((prev) => prev + 1)
		}

		const addedFriendHandler = () => {
			setUnseenRequestCount((prev) => prev - 1)
		}

		pusherClient.bind('incoming_friend_requests', friendRequestHandler)
		pusherClient.bind('new_friend', addedFriendHandler)

		return () => {
			pusherClient.unsubscribe(
				toPusherKey(`user:${sessionId}:incoming_friend_requests`)
			)
			pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

			pusherClient.unbind('new_friend', addedFriendHandler)
			pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
		}
	}, [sessionId])

	return (
		<Link
			href="/dashboard/request"
			className="text-gray-700 hover:text-red-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
		>
			<div className="text-gray-400 border-gray-400 group-hover:border-red-600 group-hover:text-red-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
				<User className="h-4 w-4" />
			</div>

			<p className="truncate">Friend Requests</p>

			{unseenRequestCount > 0 ? (
				<div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-red-600">
					{unseenRequestCount}
				</div>
			) : null}
		</Link>
	)
}
