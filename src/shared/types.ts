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
    embeds: BuilderTypedInputValue<EmbedBuilderConfig[]>;
    components: BuilderTypedInputValue<BuilderTypedInputValue<ComponentBuilderConfig[]>[]>;
    attachments: BuilderTypedInputValue<BuilderTypedInputValue<AttachmentBuilderConfig>[]>;
}

export interface EmbedBuilderConfig {
    title: string;
    description: string;
    url: string;
    color: TypedInputValue;
    fields: BuilderTypedInputValue<EmbedFieldBuilderConfig[]>;
    image: BuilderTypedInputValue<ImageBuilderConfig>;
    thumbnail: BuilderTypedInputValue<ImageBuilderConfig>;
    timestamp: TypedInputValue;
    author: BuilderTypedInputValue<AuthorBuilderConfig>;
    footer: BuilderTypedInputValue<FooterBuilderConfig>;
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

export interface AuthorBuilderConfig {
    name: string;
    url: string;
    icon_url: string;
}

export interface FooterBuilderConfig {
    text: string;
    icon_url: string;
}
