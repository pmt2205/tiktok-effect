import { Document } from 'mongoose';
export declare class NpcCategory extends Document {
    name: string;
    displayName: string;
}
export declare const NpcCategorySchema: import("mongoose").Schema<NpcCategory, import("mongoose").Model<NpcCategory, any, any, any, any, any, NpcCategory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NpcCategory, Document<unknown, {}, NpcCategory, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<NpcCategory & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, NpcCategory, Document<unknown, {}, NpcCategory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, NpcCategory, Document<unknown, {}, NpcCategory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    displayName?: import("mongoose").SchemaDefinitionProperty<string, NpcCategory, Document<unknown, {}, NpcCategory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NpcCategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, NpcCategory>;
