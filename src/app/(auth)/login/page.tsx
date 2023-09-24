'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/icons/icons'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'

export default function page() {
	const [loading, setLoading] = useState(false)

	async function loginWithGoogle() {
		setLoading(true)

		try {
			await signIn('google')
		} catch (error) {
			toast.error('Something went wrong with Google...')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="w-full flex flex-col items-center max-w-md space-y-8">
				<div className="flex flex-col items-center gap-8">
					Logo
					<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
						Sign in to your account
					</h2>
				</div>

				<Button
					className={cn(
						'max-w-sm mx-auto w-full',
						loading && 'opacity-50 pointer-events-none'
					)}
					isLoading={loading}
					onClick={loginWithGoogle}
				>
					{!loading && <GoogleIcon className="w-6 h-6 mr-4" />}
					Google
				</Button>
			</div>
		</div>
	)
}
