import type { MessageUpsertType, GroupMetadata } from "@whiskeysockets/baileys";

export type Command = {
    /** Names or alias of the commands */
    command: string[];

    /** Description of the command */
    desc: string;

    /** Function executed when the command is triggered */
    operate: (params: CommandContext) => Promise<any>;

    /** Optional source file path (for dev/debugging) */
    __source?: string;
};

export type Commands = Command[]
export type Contact = {
    name: string;
    number: string;
    country: string;
    countryCode: string;
    flag: string;
};


export type Contacts = Contact[];

export type QuotedMessage = {
    mtype: MessageUpsertType;
    id: string;
    chat: string;
    isBaileys: boolean;
    sender: string;
    text: string;
    mentionedJid: string[];
    fromMe: boolean;
    vcf: Contacts;
};

export type SerializedMessage = {
    id: string; // Id of the message
    chat: string; // JID of the chat
    isBaileys: boolean;
    isGroup: boolean;
    groupMetadata: GroupMetadata;
    sender: string;
    groupAdmin: string[];
    isGroupAdmin: boolean;
    amGroupAdmin: boolean;
    fromMe: boolean;
    mtype: MessageUpsertType;
    body: string;
    contacts: Contacts;
    mentionedJid: string[];
    quoted: QuotedMessage;
};
export type Settings = {
    prefix: string;
    chatbot: "on" | "off";
    menustyle: "1" | "2" | string;
    training: "on" | "off";
    autorecordtype: "on" | "off";
    autoread: "on" | "off";
    lang: "en" | "fr" | string;
    awc: "on" | "off";
    addprefix: string;
    asc: boolean;
    mode: "private" | "public";
    antidelete: "private" | "off" | string;
    antiedite: "private" | "off" | string;
    autoviewstatus: boolean;
    autoreactstatus: boolean;
    autoreplystatus: boolean;
    diffusion:boolean;
    statusemojis: string;
};

export type Privacy = {
    mess: {
        addNewContact: string;
        diffusionmode:string;
    };
    statusblacklist: string[];
    sudo: string[]; // JIDs des admins
    badWords: string[];
    lastforwarding: string; // ISO Date
    scheduled: any[];
}

export type BotSettings = {
    settings: Settings,
} & Privacy;

export type BotCommandContext = {
    sendPrivate: (jid: string, message: string) => Promise<void>;
    Tayc: WASocket; // client instance
    sendText: (jid: string, text: string) => Promise<void>;
    reply: (text: string) => Promise<void>;
    react: (emoji: string) => Promise<void>;
    m: SerializedMessage;
    key: proto.IMessageKey;
    body: string;
    quoted: SerializedMessage["quoted"];
    chatId: string;
    sender: string;
    isGroup: boolean;
    isGroupAdmin: boolean;
    amGroupAdmin: boolean;
    isBotAdmin: boolean;
    isOwner: boolean;
    isBotUser: boolean;
    simulatePresence: (jid: string, duration?: number) => Promise<void>;
    botNumber: string;
    prefix: string;
    from: string;
    botMode: BotSettings["settings"]["mode"];
    settings: BotSettings["settings"];
    participants: any[];
    groupMetadata: SerializedMessage["groupMetadata"];
    quotedMessage: QuotedMessage | null;
    command: string;
    botContact: string;
    markAsRead: (jid: string) => Promise<void>;
    FORWARDMESSAGE: () => Promise<void>;
    estimateForwardTime: () => number;
    getForwardStatus: () => boolean;
    stopForwarding: () => void;
    deleteM: () => Promise<void>;
    args: string[];
    mess: typeof globalThis.mess;
    text: string;
    allCommands: Command[];
    Settings: BotSettings;
    saveNewSetting: () => void;
    full: string;
    body:string;
    cmd: string;
    raw: proto.IWebMessageInfo;
};

export type GroupContactCount = {
    name: string,
    id: string,
    count: number,
    size:number,
    jid:string
}
export type Types = { SerializedMessage: SerializedMessage, }