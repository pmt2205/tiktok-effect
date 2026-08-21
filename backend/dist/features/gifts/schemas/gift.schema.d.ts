import { Document } from 'mongoose';
export declare class Gift extends Document {
    giftId: number;
    name: string;
    coins: number;
    icon: string;
    videos: string[];
    activeVideo?: string;
}
export declare const GiftSchema: import("mongoose").Schema<Gift, import("mongoose").Model<Gift, any, any, any, any, any, Gift>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Gift, Document<unknown, {}, Gift, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Gift, Document<unknown, {}, Gift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    giftId?: import("mongoose").SchemaDefinitionProperty<number, Gift, Document<unknown, {}, Gift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Gift, Document<unknown, {}, Gift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    coins?: import("mongoose").SchemaDefinitionProperty<number, Gift, Document<unknown, {}, Gift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    icon?: import("mongoose").SchemaDefinitionProperty<string, Gift, Document<unknown, {}, Gift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    videos?: import("mongoose").SchemaDefinitionProperty<string[], Gift, Document<unknown, {}, Gift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    activeVideo?: import("mongoose").SchemaDefinitionProperty<string | undefined, Gift, Document<unknown, {}, Gift, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Gift & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Gift>;
