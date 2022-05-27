using VendistaAPI;

var builder = WebApplication.CreateBuilder(
    new WebApplicationOptions { WebRootPath = "Static" }
);

builder.Services.AddCors();
var app = builder.Build();

app.UseCors(builder => builder.AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod());

app.UseStaticFiles();

app.MapGet("/", async (context) =>
{
    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.SendFileAsync("Static/index.html");
});

// Типы команд
app.MapGet("/commands/types", async (context) => 
{
    context.Response.ContentType = "application/json; charset=utf-8";
    await context.Response.SendFileAsync("Static/types.json");
});

int transId = 611659;               // счетчик принятых команд

app.MapPost("/terminals/{id}/commands", async (context) =>
{
    
    try
    {
        // получаем данные пользователя
        var command = await context.Request.ReadFromJsonAsync<Command>();
        if (command != null)
        {
            context.Response.ContentType = "application/json; charset=utf-8";

            command.terminal_id = Int32.Parse(context.Request.Path.ToString().Split('/')[2]);
            command.state = 0;
            command.state_name = "Не отправлено";
            command.time_created = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
            command.id = ++transId;

            var response = new 
            {   item = command,
                success = true
            };
            await context.Response.WriteAsJsonAsync(response);
        }
        else
        {
            throw new Exception("Некорректные данные");
        }
    }
    catch (Exception)
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { message = "Некорректные данные" });
    }
});

app.Run();
