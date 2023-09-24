import { fetchRedis } from '@/actions/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { addFriendSchema } from '@/lib/validations/add-friend'
import { getServerSession } from 'next-auth'
import { ZodError } from 'zod'

export async function POST(req: Request) {
	try {
		const body = await req.json() // <=> req.body

		const { email: emailToAdd } = addFriendSchema.parse(body.email) // validate with zod

		const idToAdd = (await fetchRedis('get', `user:email:${emailToAdd}`)) as
			| string
			| null

		if (!idToAdd) {
			return new Response('User not found', { status: 404 })
		}

		const session = await getServerSession(authOptions)

		if (!session) {
			return new Response('Unauthorized', { status: 401 })
		}

		if (idToAdd === session.user.id) {
			return new Response('You cannot add yourself as a friend', {
				status: 400,
			})
		}

		// check user already added
		const isAlreadyAdded = (await fetchRedis(
			'sismember',
			`user:${idToAdd}:incoming_friend_requests`,
			session.user.id
		)) as 0 | 1

		if (isAlreadyAdded) {
			return new Response('User already added', { status: 400 })
		}

		// check user already friend
		const isAlreadyFriend = (await fetchRedis(
			'sismember',
			`user:${session.user.id}:friends`,
			idToAdd
		)) as 0 | 1

		if (isAlreadyFriend) {
			return new Response('User already added', { status: 400 })
		}

		/*
		 * valid request, send friend request
		 */
		// WEBSCOKET: notify all clients
		pusherServer.trigger(
			toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
			'incoming_friend_requests',
			{
				senderId: session.user.id,
				senderEmail: session.user.email,
			}
		)

		db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

		return new Response('Friend request sent', { status: 200 })
	} catch (error) {
		if (error) {
			if (error instanceof ZodError) {
				return new Response('Invalid request payload', { status: 422 })
			}

			return new Response('Internal server error', { status: 500 })
		}
	}
}
