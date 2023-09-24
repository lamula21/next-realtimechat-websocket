import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export default async function DashBoardPage() {
	const session = await getServerSession(authOptions)

	return (
		<main className="p-10">
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</main>
	)
}
