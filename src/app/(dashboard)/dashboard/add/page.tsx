import { AddFriendForm } from '@/components/add-friend-form'
import React from 'react'

export default function page() {
	return (
		<main className="p-10">
			<h1 className="font-bold text-5xl mb-8">
				Add a friend
				<AddFriendForm />
			</h1>
		</main>
	)
}
