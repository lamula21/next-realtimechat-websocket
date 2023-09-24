import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import Image from 'next/image'

import { FriendRequest } from '@/components/friend-request'
import { SignOutButton } from '@/components/sign-out-button'
import { Icon, Icons } from '@/components/icons/icons'
import { authOptions } from '@/lib/auth'
import { getFriendsByUserId } from '@/actions/get-friends'
import { getUnseenRequestCount } from '@/actions/get-unseen-request-count'
import ChatList from '@/components/chat-list'

interface Props {
	children: ReactNode
}

interface SidebarOption {
	id: number
	name: string
	href: string
	Icon: Icon
}

const sidebarOptions: SidebarOption[] = [
	{
		id: 1,
		name: 'Add friend',
		href: '/dashboard/add',
		Icon: 'UserPlus',
	},
]

export default async function DashBoardLayout({ children }: Props) {
	const session = await getServerSession(authOptions)

	if (!session) notFound()

	const friends = await getFriendsByUserId(session.user.id)

	const unseenRequestCount = await getUnseenRequestCount(session.user.id)

	return (
		<main className="flex w-full">
			<nav className="flex h-screen">
				<div className="flex flex-col h-full max-w-xs grow gap-y-7 overflow-y-auto border-r border-gray-200 bg-white px-6">
					<div className="flex flex-col flex-1 gap-y-7">
						<Link
							href="/dashboard"
							className="flex h-16 shrink-0 items-center text-red-600"
						>
							{/* <Icons.Logo className="h-8 w-auto text-indigo-600" /> */}T E R
							P N E T
						</Link>

						<div className="flex flex-col gap-5">
							{friends.length > 0 && (
								<div className="text-xs font-semibold leading-6 text-gray-400">
									Your chats
								</div>
							)}

							<ul role="list" className="flex flex-col gap-y-7">
								<li className="">
									<ChatList friends={friends} sessionId={session.user.id} />
								</li>
							</ul>
						</div>
						<div className="flex flex-col gap-5">
							<div className="text-xs font-semibold leading-6 text-gray-400">
								Overview
							</div>
							<ul role="list" className="-mx-2 space-y-1">
								{sidebarOptions.map((option) => {
									const Icon = Icons[option.Icon]
									return (
										<li key={option.id}>
											<Link
												href={option.href}
												className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold "
											>
												<span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
													<Icon className="h-4 w-4" />
												</span>
												<span className="truncate">{option.name}</span>
											</Link>
										</li>
									)
								})}

								<div className="">
									<FriendRequest
										sessionId={session.user.id}
										initialUnseenRequestCount={unseenRequestCount}
									/>
								</div>
							</ul>
						</div>
					</div>

					<div className="flex items-center">
						<div className="flex flex-1 items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-gray-900">
							<div className="relative h-8 w-8 bg-gray-50">
								<Image
									fill
									referrerPolicy="no-referrer"
									className="rounded-full"
									src={session.user.image || ''}
									alt="User profile picture"
								/>
							</div>
							<span className="sr-only">Your profile</span>
							<div className="flex flex-col">
								<span aria-hidden="true">{session.user.name}</span>
								<span className="text-xs text-zinc-400" aria-hidden="true">
									{session.user.email}
								</span>
							</div>
							<SignOutButton className="h-full aspect-square" />
						</div>
					</div>
				</div>
			</nav>
			{children}
		</main>
	)
}
