using LuxPrismatis.Core.Enums;
using LuxPrismatis.Core.Generation;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text.Json;

namespace FuriousRhino.Web.Sites.Api.Controllers
{
    [ApiController]
    [Route("luxprismatis")]
    public class LuxPrismatis(IWebHostEnvironment env) : Controller
    {
        private readonly IWebHostEnvironment _env = env;

        [HttpGet("daily")]
        public async Task<IActionResult> GetDailyLevel()
        {
            var today = DateTime.UtcNow.AddHours(-7).Date;

            var basePath = Environment.GetEnvironmentVariable("LEVELS_PATH") ?? _env.ContentRootPath;
            var levelsPath = Path.Combine(basePath, "levels");
            Directory.CreateDirectory(levelsPath);

            var fileLabel = $"daily-{today:yyyy-MM-dd}";
            var fileName = $"{fileLabel}.json";
            var filePath = Path.Combine(levelsPath, fileName);
            var lockPath = filePath + ".lock";

            await using var lockStream = new FileStream(
                lockPath,
                FileMode.OpenOrCreate,
                FileAccess.ReadWrite,
                FileShare.None);
            if (!System.IO.File.Exists(filePath))
            {
                const int MaxRetries = 10;

                for (int attempt = 1; attempt <= MaxRetries; attempt++)
                {
                    try
                    {
                        var request = new LevelGenerator.GenerationRequest
                        {
                            Difficulty = Random.Shared.Next(6, 11),
                            UnlockedPacks = new HashSet<Availability> { Availability.Base, Availability.AddonPack1, Availability.AddonPack2 },
                            LevelId = fileLabel,
                            DisplayName = fileLabel,
                            Seed = attempt == 1 ? null : (int?)Environment.TickCount * attempt,
                        };

                        var generator = new LevelGenerator();
                        var level = generator.Generate(request);

                        var json = JsonSerializer.Serialize(level);
                        await System.IO.File.WriteAllTextAsync(filePath, json);
                    }
                    catch (InvalidOperationException) when (attempt < MaxRetries) { }
                    catch (InvalidOperationException)
                    {
                        return StatusCode(StatusCodes.Status500InternalServerError, "Failed to retrieve Daily Challenge");
                    }
                }
            }

            // Build the public URL
            var publicUrl = $"/levels/{fileName}";

            // Compute ETag for conditional redirect
            var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var etag = $"\"{Convert.ToHexString(SHA256.HashData(bytes))}\"";

            if (Request.Headers.IfNoneMatch == etag)
                return StatusCode(StatusCodes.Status304NotModified);

            Response.Headers.ETag = etag;
            Response.Headers.CacheControl = "public, max-age=60, must-revalidate";

            return Redirect(publicUrl);
        }
    }
}
