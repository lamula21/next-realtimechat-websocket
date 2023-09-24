'use client'

import { ButtonHTMLAttributes, useState } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, LogOutIcon } from 'lucide-react'

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function SignOutButton({ ...props }) {
	const [signinOut, setSigninOut] = useState(false)

	const onSignOut = async () => {
		setSigninOut(true)

		try {
			await signOut()
		} catch (error) {
			toast.error('There was an error signing out')
			setSigninOut(false)
		}
		// finally {
		// 	setSigninOut(false)
		// }
	}

	return (
		<Button {...props} variant="ghost" onClick={onSignOut}>
			{signinOut && <Loader2 className="animate-spin h-4 w-4" />}
			{!signinOut && <LogOutIcon className="h-4 w-4" />}
		</Button>
	)
}
