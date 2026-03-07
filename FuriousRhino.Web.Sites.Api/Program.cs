using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

// Ensure the data directory exists before mounting the file provider
Directory.CreateDirectory($"{Environment.GetEnvironmentVariable("LEVELS_PATH")}/levels");


app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(
            Environment.GetEnvironmentVariable("LEVELS_PATH") ?? app.Environment.ContentRootPath,
            "levels")),
    RequestPath = "/levels"
});

app.MapControllers();

app.Run();
