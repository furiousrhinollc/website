using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Environment.GetEnvironmentVariable("LEVELS_PATH") ??
        Path.Combine(builder.Environment.ContentRootPath, "levels")),
    RequestPath = "/levels"
});

app.Run();
