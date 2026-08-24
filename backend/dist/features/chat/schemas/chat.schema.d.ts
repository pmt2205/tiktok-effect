import { Document } from 'mongoose';
export declare class ChatMessage extends Document {
    sender: string;
    receiver: string;
    message: string;
    read: boolean;
}
export declare const ChatMessageSchema: import("mongoose").Schema<ChatMessage, import("mongoose").Model<ChatMessage, any, any, any, any, any, ChatMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatMessage, Document<unknown, {}, ChatMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    read?: import("mongoose").SchemaDefinitionProperty<boolean, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sender?: import("mongoose").SchemaDefinitionProperty<string, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    receiver?: import("mongoose").SchemaDefinitionProperty<string, ChatMessage, Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ChatMessage>;
