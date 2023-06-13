import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { IGame } from "src/interfaces/game.interface";
import { Game } from "./game";
import { Interval } from "@nestjs/schedule";
import { UsersService } from "src/users/users.service";
import { IUser } from "src/interfaces/user.interface";

@Injectable()
export class GamesService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly usersService: UsersService,
	) {}

	private games: IGame[] = [];
	private queue: IUser[] = [];

	addGame(game: IGame) {
		if (this.getGame(game.id)) return;
		this.games.push(game);
		return game;
	}

	addToQueue(user: IUser) {
		if (this.queue.find((u) => u.id === user.id)) return;
		this.queue.push(user);
	}

	removeGame(id: string) {
		this.games = this.games.filter((g) => g.id !== id);
	}

	getGame(id: string) {
		return this.games.find((g) => g.id === id);
	}

	async createGame(id: string): Promise<IGame> {
		const game = new Game(this.prismaService, id);
		game.addPlayer(this.usersService.getUser(id));
		await game.create();
		this.addGame(game);
		return game;
	}

	// Interval, 1 time per 5 seconds
	@Interval(3000)
	checkGames() {
		if (this.queue.length >= 2) {
			const game = new Game(this.prismaService, "test");
			game.addPlayer(this.queue[0]);
			game.addPlayer(this.queue[1]);
			this.queue.splice(0, 2);
			game.create();
			this.addGame(game);
		} else {
			console.log("Waiting for players..." + this.queue.length);
		}
	}
}