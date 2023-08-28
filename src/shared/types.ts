export interface BuilderTypedInput<T> {
    type: string;
    value: string;
    config?: T;
}

export interface TypedInput {
    type: string;
    value: string;
}

export interface MessageBuilderConfig {
    embeds: BuilderTypedInput<BuilderTypedInput<EmbedBuilderConfig>[]>;
    components: BuilderTypedInput<BuilderTypedInput<BuilderTypedInput<ComponentBuilderConfig>[]>[]>;
    attachments: BuilderTypedInput<BuilderTypedInput<AttachmentBuilderConfig>[]>;
}

export interface EmbedBuilderConfig {
    title: string;
    description: string;
    fields: BuilderTypedInput<EmbedFieldBuilderConfig>[];
}

export interface ComponentBuilderConfig {}

export interface AttachmentBuilderConfig {}

export interface EmbedFieldBuilderConfig {}
