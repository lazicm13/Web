namespace RideService.Services
{
    public class RideGenerator
    {
        public double GenerateDistance()
        {
            Random random = new Random();
            double randomDistance = random.NextDouble() * 100;
            return randomDistance;
        }

        public double CalculatePrice(double distance)
        {
            double price = distance * 2;
            return price;
        }

        public string GenerateWaitTime()
        {
            Random random = new Random();

            int minutes = random.Next(1, 5);

            string waitTime = $"{minutes:D2}";

            return waitTime;
        }
    }
}

