'use client'
import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { addFriendSchema } from '@/lib/validations/add-friend'

type FormData = z.infer<typeof addFriendSchema>

export function AddFriendForm() {
	const [success, setSuccess] = useState(false)

	// pass the schema to the form, handles error for us
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(addFriendSchema),
	})

	// form onSubmit function
	async function addFriend(email: string) {
		try {
			const validatedEmail = addFriendSchema.parse({ email })

			const res = await axios.post('/api/friends/add', {
				email: validatedEmail,
			})

			setSuccess(true)
		} catch (error) {
			if (error instanceof z.ZodError) {
				setError('email', { message: error.message })
				return
			}

			if (error instanceof AxiosError) {
				setError('email', { message: error.response?.data })
				return
			}

			setError('email', { message: 'Something went wrong' })
		}
	}

	function onSubmit(data: FormData) {
		addFriend(data.email)
	}

	return (
		<form className="max-w-sm" onClick={handleSubmit(onSubmit)}>
			<label
				htmlFor="email"
				className="block text-sm font-medium leading-6 text-gray-900"
			>
				Add friend by E-mail
			</label>

			<div className="mt-2 flex gap-4">
				<input
					{...register('email')}
					type="text"
					className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
					placeholder="you@example.com"
				/>

				<Button>Add</Button>
			</div>

			<p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>

			{success && (
				<p className="mt-1 text-sm text-green-600">Friend request sent!</p>
			)}
		</form>
	)
}
