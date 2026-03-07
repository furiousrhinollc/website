namespace FuriousRhino.Web.Sites.Main.Models;

public record RoadmapItem(
    string Label,
    string Description,
    RoadmapStatus Status
);

public enum RoadmapStatus
{
    Done,
    InProgress,
    Upcoming
}
