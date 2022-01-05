import { useEffect, useState } from 'react';

const Chat = ({ supabase }) => {
	// console.log(supabase);

	const [messages, setMessages] = useState([]);

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

	return (
		<div>
			{messages.map((message) => (
				<div key={message.id}>{message.content}</div>
			))}
		</div>
	);
};

export default Chat;
