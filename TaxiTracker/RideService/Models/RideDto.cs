namespace RideService.Models
{
    public class RideDto
    {
        public string StartAddress {  get; set; }
        public string EndAddress { get; set; }
        public double Price {  get; set; }
        public double Distance {  get; set; }
        public string WaitingTime {  get; set; }
    }
}
