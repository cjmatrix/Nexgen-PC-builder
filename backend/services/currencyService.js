import { redisConnection } from "../config/redis.js";

const CACHE_KEY = 'INR_USD_RATE';
const CACHE_DURATION_SECONDS = 24 * 60 * 60; 

export const getInrToUsdRate = async () => {
  try {
   
    const cachedRate = await redisConnection.get(CACHE_KEY);
    
    if (cachedRate) {
      return parseFloat(cachedRate);
    }

    const apiKey = process.env.FAST_FOREX_API_KEY;
    const fromCurrency = "INR";
    const toCurrency = "USD";
    
    const response = await fetch(
      `https://api.fastforex.io/fetch-one?from=${fromCurrency}&to=${toCurrency}&api_key=${apiKey}`
    );
    
    if (!response.ok) {
       throw new Error(`FastForex API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // FastForex Response structure: { result: { USD: 0.012 }, ... }
    if (data && data.result && data.result[toCurrency]) {
        const liveRate = data.result[toCurrency];

        await redisConnection.set(CACHE_KEY, liveRate, "EX", CACHE_DURATION_SECONDS);
        
        return liveRate;
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("Currency fetch error:", error);
    

    return 0.011; 
  }
};