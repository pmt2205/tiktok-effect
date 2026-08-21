import { Document } from 'mongoose';
export declare class Settings extends Document {
    username: string;
    duration: number;
    density: number;
    theme: string;
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
}, Settings>;
export declare class Mapping extends Document {
    username: string;
    giftName: string;
    effect: string;
    videoUrl?: string;
}
export declare const MappingSchema: import("mongoose").Schema<Mapping, import("mongoose").Model<Mapping, any, any, any, any, any, Mapping>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Mapping, Document<unknown, {}, Mapping, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Mapping & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Mapping, Document<unknown, {}, Mapping, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Mapping & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    username?: import("mongoose").SchemaDefinitionProperty<string, Mapping, Document<unknown, {}, Mapping, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Mapping & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    giftName?: import("mongoose").SchemaDefinitionProperty<string, Mapping, Document<unknown, {}, Mapping, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Mapping & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    effect?: import("mongoose").SchemaDefinitionProperty<string, Mapping, Document<unknown, {}, Mapping, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Mapping & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    videoUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, Mapping, Document<unknown, {}, Mapping, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Mapping & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Mapping>;
