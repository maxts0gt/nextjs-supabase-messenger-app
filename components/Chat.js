import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Chat.module.css';

const Chat = ({ currentUser, session, supabase }) => {
	// console.log(supabase);

	if (!currentUser) return null;

	const [messages, setMessages] = useState([]);
	const [editingUsername, setEditingUsername] = useState(false);
	const message = useRef('');
	const newUsername = useRef('');

	useEffect(async () => {
		const getMessages = async () => {
			let { data: messages, error } = await supabase
				.from('message')
				.select('*');

			setMessages(messages);
		};

		await getMessages();

		const setUpMessageSubscription = async () => {
			await supabase
				.from('message')
				.on('INSERT', (payload) => {
					console.log('Change received!', payload);
					setMessages((previous) => [].concat(previous, payload.new));
				})
				.subscribe();
		};

		await setUpMessageSubscription();
	}, []);

	const sendMessage = async (evt) => {
		evt.preventDefault();

		const content = message.current.value;
		await supabase
			.from('message')
			.insert([{ content, user_id: session.user.id }]);

		message.current.value = '';
	};

	const logout = (evt) => {
		evt.preventDefault();
		window.localStorage.clear();
		window.location.reload();
	};

	const setUsername = async (evt) => {
		evt.preventDefault();
		const username = newUsername.current.value;
		await supabase
			.from('user')
			.insert([{ ...currentUser, username }], { upsert: true });
		newUsername.current.value = '';
		setEditingUsername(false);
	};

	const getUsersFromSupabase = async (users, userIds) => {
		const usersToGet = Array.from(userIds).filter(
			(userIds) => !users[userIds]
		);
		if (Object.keys(users).length && usersToGet.length == 0) return users;

		const { data } = await supabase
			.from('user')
			.select('id, username')
			.in('id', usersToGet);
		const newUsers = {};
		data.forEach((user) => (newUsers[user.id] = user));
		return Object.assign({}, users, newUsers);
	};

	useEffect(async () => {
		const getUsers = async () => {
			const userIds = new Set(messages.map((message) => message.user_id));
			const newUsers = await getUsersFromSupabase(users, userIds);
			setUsers(newUsers);
		};
		await getUsers();
	}, [messages]);

	return (
		<>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<h1>Supabase Chat</h1>
					<p className={styles.headerUser}>
						Welcome,{' '}
						{currentUser.username
							? currentUser.username
							: session.user.email}
					</p>
				</div>

				<div className={styles.settings}>
					{editingUsername ? (
						<form onSubmit={setUsername}>
							<input
								className={styles.updateUser}
								placeholder='New Username'
								required
								ref={newUsername}
							></input>
							<button className={styles.btnnn} type='submit'>
								Update
							</button>
						</form>
					) : (
						<div>
							<button
								className={styles.btn}
								onClick={() => setEditingUsername(true)}
							>
								Edit username
							</button>
							<button
								className={styles.btnn}
								onClick={(evt) => logout(evt)}
							>
								logout
							</button>
						</div>
					)}
				</div>
			</div>
			<div className={styles.container}>
				{messages.map((message) => (
					<div key={message.id} className={styles.messageContainer}>
						{/* <span className={styles.user}>
							{username(message.user_id)}
						</span> */}
						<div>{message.content}</div>
					</div>
				))}
			</div>

			<form className={styles.chat} onSubmit={sendMessage}>
				<input
					className={styles.messageInput}
					required
					type='text'
					placeholder='Write your message'
					ref={message}
				/>
				<button className={styles.submit} type='submit'>
					Send Message
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</button>
			</form>
		</>
	);
};

export default Chat;
