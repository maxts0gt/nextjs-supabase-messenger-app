import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Auth from '../components/Auth';
import Chat from '../components/Chat';
import { useEffect, useState } from 'react';

export default function Home({ session, supabase }) {
	const [loggedIn, setLoggedIn] = useState(false);

	useEffect(() => {
		setLoggedIn(!!session);
	}, [session]);

	return (
		<div className={styles.container}>
			<Head>
				<title>SupabaseChat</title>
			</Head>

			<main className={styles.main}>
				{loggedIn ? (
					<Chat supabase={supabase} />
				) : (
					<Auth supabase={supabase} />
				)}
			</main>
		</div>
	);
}
