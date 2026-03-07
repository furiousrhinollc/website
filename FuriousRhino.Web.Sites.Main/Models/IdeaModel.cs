namespace FuriousRhino.Web.Sites.Main.Models;

public record IdeaModel(
    string Title,
    string Description,
    string CategoryLabel,
    IdeaStatus Status = IdeaStatus.Thinking
);

public enum IdeaStatus
{
    Thinking,    // Just an idea
    Developing,  // Work in progress
    Exploring,   // Actively researching / prototyping
    Shelved      // Not right now
}
