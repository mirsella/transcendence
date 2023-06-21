import { IChat, IMessage, chatType } from "src/interfaces/chat.interface";
import { IUser } from "src/interfaces/user.interface";

export class Chat implements IChat {
	id: string;
	name: string;
	type: chatType;
	createdAt: Date;
	updatedAt: Date;
	messages: IMessage[];
	users: IUser[];

	constructor(id: string, name: string, type: chatType) {
		this.id = id
		this.name = name;
		this.type = type;
		this.createdAt = new Date();
		this.updatedAt = new Date();
		this.messages = [];
		this.users = [];
	}

	addMessage(message: IMessage): void {
		this.updatedAt = new Date();
		this.messages.push(message);
		this.emitToUsers("newMessage", { channelId: this.id, message: {
			sender: {
				id: message.sender.id,
				name: message.sender.name
			},
			content: message.content,
		}});
	}

	addUser(user: IUser): void {
		if (!this.users.find((u) => u.id === user.id)) {
			this.users.push(user);
			this.emitToUsers("userJoined", {channelId: this.id, user: { id: user.id, name: user.name } })
		}
	}

	removeUser(user: IUser): void {
		if (this.users.find((u) => u.id === user.id)) {
			this.users = this.users.filter((u) => u.id !== user.id);
			const { socket, ...userWithoutSocket } = user;
			this.emitToUsers("userLeft", userWithoutSocket)
		}
	}

	emitToUsers(event: string, data: any): void {
		for (const user of this.users) {
			user.socket.emit(event, data);
		}
	}
}
