export function calculatePrice({
    distance,
    costPerKm,
    utilization = 0,
  }) {
    const d = Number(distance) || 0;
    const rate = Number(costPerKm) || 0;
  
    const baseFare = 500;
    const distanceCost = d * rate;
  
    // optional load factor (can be 0)
    const loadFactor = 1 + utilization / 100;
  
    const subtotal = baseFare + distanceCost * loadFactor;
    const tax = 0.1 * subtotal;
  
    return Math.round(subtotal + tax);
  }
  