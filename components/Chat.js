import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Chat.module.css';

const Chat = ({ session, supabase }) => {
	// console.log(supabase);

	const [messages, setMessages] = useState([]);
	const message = useRef('');

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

	return (
		<>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<h1>Supabase Chat</h1>
					<p className={styles.headerUser}>
						{/* Welcome,{' '}
						{currentUser.username
							? currentUser.username
							: session.user.email} */}
					</p>
				</div>

				<div className={styles.settings}>
					{/* {editingUsername ? (
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
					)} */}
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
