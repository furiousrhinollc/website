using Microsoft.AspNetCore.Components;

namespace FuriousRhino.Web.Sites.Main.Models;

public record GameModel(
    string Title,
    string Description,
    string LogoPath,
    string TagLabel,
    string TagCssClass,
    string LinkHref,
    bool IsDashed = false
);
