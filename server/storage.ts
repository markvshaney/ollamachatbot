import { messages, type Message, type InsertMessage, type User, type InsertUser, users } from "@shared/schema";

// Modify the interface with all needed CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Add message methods
  getMessages(): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messagesList: Map<number, Message>;
  private currentUserId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.messagesList = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messagesList.values()).sort((a, b) => a.id - b.id);
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message = {
      id,
      role: insertMessage.role,
      content: insertMessage.content,
      model: insertMessage.model,
      timestamp: insertMessage.timestamp
    };
    this.messagesList.set(id, message);
    console.log("Storage: message added", JSON.stringify(message, null, 2));
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messagesList.clear();
  }
}

export const storage = new MemStorage();
