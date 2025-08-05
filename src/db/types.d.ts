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
    statusemojis: string;
};

export type Privacy = {
    mess: {
        addNewContact: string;
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


export type Types = { SerializedMessage: SerializedMessage, }