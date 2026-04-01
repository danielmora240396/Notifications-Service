export interface DiscordField {
  name: string;
  value: string;
  inline: boolean;
}

export interface DiscordEmbed {
  title: string;
  color: number;
  fields: DiscordField[];
  footer: {
    text: string;
  };
}

export interface DiscordNotificationBody {
  username: string;
  content: string;
  embeds: DiscordEmbed[];
}
