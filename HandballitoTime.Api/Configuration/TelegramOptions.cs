namespace HandballitoTime.Api.Configuration;

public class TelegramOptions
{
    public string BotToken { get; set; } = default!;
    public string? WebhookUrl { get; set; }
    public string SecretToken { get; set; } = default!;
}
