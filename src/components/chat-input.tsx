'use client'

import { useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { toast } from 'sonner'

interface ChatInputProps {
	chatParner: User
	chatId: string
}

export default function ChatInput({ chatParner, chatId }: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const [loading, setLoading] = useState(false)
	const [input, setInput] = useState('')

	async function sendMessage() {
		if (!input) return

		setLoading(true)

		try {
			// await new Promise((resolve) => setTimeout(resolve, 2000))
			await axios.post('/api/message/send', { text: input, chatId })
			setInput('')
			textareaRef.current?.focus()
		} catch (error) {
			toast.error('Something went wrong. Please try again later.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="border-t border-gray-200 px-4 py-4 mb-2 sm:mb-0">
			<div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
				<TextareaAutosize
					className="block w-full px-2 resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6 "
					ref={textareaRef}
					rows={1}
					value={input}
					placeholder={`Message ${chatParner.name}`}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							sendMessage()
						}
					}}
				/>

				<div
					onClick={() => textareaRef.current?.focus()}
					className="py-2"
					aria-hidden="true"
				>
					<div className="py-px">
						<div className="h-9"></div>
					</div>
				</div>

				<div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
					<div className="flex-shrink-0">
						<Button onClick={sendMessage} type="submit" isLoading={loading}>
							Post
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
