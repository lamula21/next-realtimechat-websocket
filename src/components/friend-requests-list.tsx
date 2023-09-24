'use client'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface FriendRequestListsProps {
	incomingFriendRequests: IncomingFriendRequest[]
	sessionId: string
}

export function FriendRequestLists({
	incomingFriendRequests,
	sessionId,
}: FriendRequestListsProps) {
	//
	const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
		incomingFriendRequests
	)

	const router = useRouter()

	useEffect(() => {
		pusherClient.subscribe(
			toPusherKey(`user:${sessionId}:incoming_friend_requests`)
		)

		// senderId, senderEmail comes from /send/route.js -> pusherServer.trigger()
		const friendRequestHandler = ({
			senderId,
			senderEmail,
		}: IncomingFriendRequest) => {
			setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
		}

		pusherClient.bind('incoming_friend_requests', friendRequestHandler)

		// unbind for the next render
		return () => {
			pusherClient.unsubscribe(
				toPusherKey(`user:${sessionId}:incoming_friend_requests`)
			)
			pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
		}
	}, [sessionId])

	//
	const acceptFriend = async (senderId: string) => {
		await axios.post('/api/friends/accept', { id: senderId })

		setFriendRequests((prev) =>
			prev.filter((request) => request.senderId !== senderId)
		)

		router.refresh()
	}

	//
	const denyFriend = async (senderId: string) => {
		await axios.post('/api/friends/deny', { id: senderId })

		setFriendRequests((prev) =>
			prev.filter((request) => request.senderId !== senderId)
		)

		router.refresh()
	}

	return (
		<>
			{friendRequests.length == 0 ? (
				<p className="text-sm text-zinc-500">Nothing to show here...</p>
			) : (
				friendRequests.map((request) => (
					<div key={request.senderId} className="flex gap-4 items-center">
						<UserPlus className="text-black" />
						<p className="font-medium text-lg">{request.senderEmail}</p>

						<button
							aria-label="accept friend"
							className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
							onClick={() =>
								toast.promise(acceptFriend(request.senderId), {
									loading: 'Accepting friend request...',
									success: () => {
										return 'Friend request accepted!'
									},
									error: 'Failed to accept friend request',
								})
							}
						>
							<Check className="font-semibold text-white w-3/4 h-3/4" />
						</button>

						<button
							aria-label="deny friend"
							className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
							onClick={() =>
								toast.promise(denyFriend(request.senderId), {
									loading: 'Denying friend request...',
									success: () => {
										return 'Friend request denied!'
									},
									error: 'Failed to deny friend request',
								})
							}
						>
							<X className="font-semibold text-white w-3/4 h-3/4" />
						</button>
					</div>
				))
			)}
		</>
	)
}
