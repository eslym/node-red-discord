export interface BuilderTypedInputValue<T> {
    type: string;
    value: string;
    config?: T;
}

export interface TypedInputValue {
    type: string;
    value: string;
}

export interface MessageBuilderConfig {
    embeds: BuilderTypedInputValue<BuilderTypedInputValue<EmbedBuilderConfig>[]>;
    components: BuilderTypedInputValue<
        BuilderTypedInputValue<BuilderTypedInputValue<ComponentBuilderConfig>[]>[]
    >;
    attachments: BuilderTypedInputValue<BuilderTypedInputValue<AttachmentBuilderConfig>[]>;
}

export interface EmbedBuilderConfig {
    title: string;
    description: string;
    fields: BuilderTypedInputValue<EmbedFieldBuilderConfig>[];
}

export interface ComponentBuilderConfig {}

export interface AttachmentBuilderConfig {}

export interface EmbedFieldBuilderConfig {
    name: string;
    value: string;
    inline: TypedInputValue;
}

export interface ImageBuilderConfig {
    url: string;
    width: TypedInputValue;
    height: TypedInputValue;
}
