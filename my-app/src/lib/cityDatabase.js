// cityDatabase.js

export const cities = [
    { name: "Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
    { name: "Pune", lat: 18.5204, lon: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
    { name: "Surat", lat: 21.1702, lon: 72.8311 },
    { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
    { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
    { name: "Indore", lat: 22.7196, lon: 75.8577 },
    { name: "Thane", lat: 19.2183, lon: 72.9781 },
    { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
    { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
    { name: "Patna", lat: 25.5941, lon: 85.1376 },
    { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
    { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
    { name: "Ludhiana", lat: 30.9010, lon: 75.8573 },
    { name: "Agra", lat: 27.1767, lon: 78.0081 },
    { name: "Nashik", lat: 19.9975, lon: 73.7898 },
    { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
    { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
    { name: "Meerut", lat: 28.9845, lon: 77.7064 },
    { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
    { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
    { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
    { name: "Aurangabad", lat: 19.8762, lon: 75.3433 },
    { name: "Dhanbad", lat: 23.7957, lon: 86.4304 },
    { name: "Amritsar", lat: 31.6340, lon: 74.8723 }
  ];
  
  export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
  }