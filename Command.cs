namespace VendistaAPI;

public class Command
{
    public int terminal_id { get; set; }
    public int command_id { get; set; }
    public int parameter1 { get; set; }
    public int parameter2 { get; set; }
    public int parameter3 { get; set; }
    public int parameter4 { get; set; }
    public object str_parameter1 { get; set; }
    public object str_parameter2 { get; set; }
    public int state { get; set; }
    public string state_name { get; set; }
    public string time_created { get; set; }
    public object time_delivered { get; set; }
    public int id { get; set; }
}