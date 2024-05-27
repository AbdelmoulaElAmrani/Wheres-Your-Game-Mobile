import {UserResponse} from "@/models/responseObjects/UserResponse";
import Gender from "@/models/Gender";

export class Message {
    // @ts-ignore
    public id: string;
    // @ts-ignore
    public message: string;
    // @ts-ignore
    public timestamp: Date;
    // @ts-ignore
    public senderId: string;
    // @ts-ignore
    public receiverId: string;

    constructor(messageId?: string, senderId?: string, content?: string, timestamp?: Date) {
        this.id = messageId || '';
        this.message = content || '';
        this.timestamp = timestamp || new Date();
        this.senderId = senderId || '';
    }
}


export class Conversation {
    // @ts-ignore
    public conversationId: string;
    // @ts-ignore
    public participant1?: UserResponse;
    // @ts-ignore
    public messages: Message[];
    // @ts-ignore
    public lastMessage?: Message;
    // @ts-ignore
    public lastActiveDate: Date;


    constructor(conversationId?: string, participant1?: UserResponse, messages?: Message[], lastMessage?: Message, lastActiveDate?: Date) {
        this.conversationId = conversationId || '';
        this.participant1 = participant1 || undefined
        this.messages = messages || [];
        this.lastMessage = lastMessage || undefined;
        this.lastActiveDate = lastActiveDate || new Date();
    }

    static generateFakeConversations = (numConversations: number): Conversation[] => {
        return Array.from({length: numConversations}, (_, i) => new Conversation(
            `${i + 1}`,
            // @ts-ignore
            {
                id: `${i + 2}`,
                role: 'PLAYER',
                countryCode: '+1',
                phoneNumber: `53245234${i}`,
                gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
                firstName: `Name${i}`,
                lastName: `Surname${i}`,
                age: i * 5,
                bio: '',
                address: '',
                dateOfBirth: new Date(),
                email: `email${i}@email.com`,
                zipCode: '',
                imageUrl: ''
            },
            [],
            new Message(`${i + 1}`, `${i + 2}`, 'Hello, how are you doing?'),
            new Date(),
        ));
    }

    getMessages = (): void => {

    }

    addMessage = (message: Message): void => {
        this.messages.push(message);
        this.lastActiveDate = new Date();
        //TODO:: send it to the back end
    }
}
