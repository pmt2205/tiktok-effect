import { Document } from 'mongoose';
export declare class NpcGift extends Document {
    username: string;
    category: string;
    giftId: number;
    name: string;
    coins: number;
    icon: string;
    videos: string[];
    activeVideo?: string;
    sounds: string[];
    activeSound?: string;
    menuText?: string;
    menuShow: boolean;
}
export declare const NpcGiftSchema: import("mongoose").Schema<NpcGift, import("mongoose").Model<NpcGift, any, any, any, any, any, NpcGift>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NpcGift, Document<unknown, {}, NpcGift, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    username?: import("mongoose").SchemaDefinitionProperty<string, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    giftId?: import("mongoose").SchemaDefinitionProperty<number, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    coins?: import("mongoose").SchemaDefinitionProperty<number, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    icon?: import("mongoose").SchemaDefinitionProperty<string, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    videos?: import("mongoose").SchemaDefinitionProperty<string[], NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    activeVideo?: import("mongoose").SchemaDefinitionProperty<string | undefined, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sounds?: import("mongoose").SchemaDefinitionProperty<string[], NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    activeSound?: import("mongoose").SchemaDefinitionProperty<string | undefined, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuText?: import("mongoose").SchemaDefinitionProperty<string | undefined, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuShow?: import("mongoose").SchemaDefinitionProperty<boolean, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string, NpcGift, Document<unknown, {}, NpcGift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcGift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, NpcGift>;
