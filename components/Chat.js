import { useEffect, useState, useRef } from 'react';

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
		<div>
			{messages.map((message) => (
				<div key={message.id}>{message.content}</div>
			))}
			<form onSubmit={sendMessage}>
				<input
					placeholder='Write your message'
					required
					ref={message}
				/>
				<button type='submit'>Sendd message</button>
			</form>
		</div>
	);
};

export default Chat;
