export type messageResp = { key: string, message: string, parent?: string, isEmpty?: boolean }

export type MessageType<T, K> = T | { val: T, message: (values: K) => string };

export interface VVCIsRequired {
    isRequired?: MessageType<boolean, void>;
}

export interface VVCIsRequiredMessage {
    isRequiredMessage?: string;
}


export interface VBadTypeMessage {
    badTypeMessage?: string;
}

export interface VDefaultValue<T> {
    defaultValue?: T
}

export interface IInfo<T>{
    info?:{
        description?:string,
        examples?:T[]
    }
}