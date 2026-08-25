import { Document } from 'mongoose';
export declare class Settings extends Document {
    username: string;
    duration: number;
    density: number;
    theme: string;
    liveMode: string;
    activeNpcCategory: string;
    menuEnabled: boolean;
    menuTitle: string;
    menuX: number;
    menuY: number;
    menuScale: number;
    menuColumns: number;
}
export declare const SettingsSchema: import("mongoose").Schema<Settings, import("mongoose").Model<Settings, any, any, any, any, any, Settings>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Settings, Document<unknown, {}, Settings, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    username?: import("mongoose").SchemaDefinitionProperty<string, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    duration?: import("mongoose").SchemaDefinitionProperty<number, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    density?: import("mongoose").SchemaDefinitionProperty<number, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    theme?: import("mongoose").SchemaDefinitionProperty<string, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    liveMode?: import("mongoose").SchemaDefinitionProperty<string, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    activeNpcCategory?: import("mongoose").SchemaDefinitionProperty<string, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuTitle?: import("mongoose").SchemaDefinitionProperty<string, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuX?: import("mongoose").SchemaDefinitionProperty<number, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuY?: import("mongoose").SchemaDefinitionProperty<number, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuScale?: import("mongoose").SchemaDefinitionProperty<number, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    menuColumns?: import("mongoose").SchemaDefinitionProperty<number, Settings, Document<unknown, {}, Settings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Settings & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Settings>;
