const https = require('https');

const candidates = {
  "Baking Tray": "https://images.unsplash.com/photo-1722454976062-b009a195e33c?w=800&q=80",
  "Basting Brush Handle": "https://images.unsplash.com/photo-1535385211-ae113f67d8d0?w=800&q=80",
  "Bowl (Katori)": "https://images.unsplash.com/photo-1592457711340-2412dc07b733?w=800&q=80",
  "Bread Knife": "https://images.unsplash.com/photo-1613865994285-83b12407bf3e?w=800&q=80",
  "Cake Mould": "https://images.unsplash.com/photo-1557925923-6982bd9650ff?w=800&q=80",
  "Canister": "https://images.unsplash.com/photo-1592824555364-48a8ca0f0caf?w=800&q=80",
  "Chef Knife": "https://images.unsplash.com/photo-1596299085622-4f96269e5bc7?w=800&q=80",
  "Cleaver": "https://images.unsplash.com/photo-1548691597-8c8944ff28b2?w=800&q=80",
  "Colander": "https://images.unsplash.com/photo-1615292027319-09a7cefb1aab?w=800&q=80",
  "Cooling Rack": "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=800&q=80",
  "Curry Bowl set": "https://images.unsplash.com/photo-1529517986296-847580704921?w=800&q=80",
  "Dinner Plate": "https://images.unsplash.com/photo-1575938955767-8a08529d73d4?w=800&q=80",
  "Fork": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
  "Frying Pan": "https://images.unsplash.com/photo-1707335820440-9fe91d0eba9e?w=800&q=80",
  "Glass (Tumbler)": "https://images.unsplash.com/photo-1584811427110-b1625c7fb2a5?w=800&q=80",
  "Grater": "https://images.unsplash.com/photo-1623707430647-d81f3f0b4a4b?w=800&q=80",
  "Gravy Spoon": "https://images.unsplash.com/photo-1589805119904-b829408eff83?w=800&q=80",
  "Grill Pan": "https://images.unsplash.com/photo-1679756716826-710469242f18?w=800&q=80",
  "Kadai": "https://images.unsplash.com/photo-1592156328757-ae2941276b2c?w=800&q=80",
  "Kitchen Scissors": "https://images.unsplash.com/photo-1542691572-c7662acf3a38?w=800&q=80",
  "Kitchen Weighing Scale Bowl": "https://images.unsplash.com/photo-1529517986296-847580704921?w=800&q=80",
  "Ladle": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80",
  "Lunch Box": "https://images.unsplash.com/photo-1632142334511-8f24c3d3ae79?w=800&q=80",
  "Masher": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80",
  "Measuring Cup Set": "https://images.unsplash.com/photo-1781082591998-1f6f2bda66e2?w=800&q=80",
  "Measuring Spoon Set": "https://images.unsplash.com/photo-1781082580025-407abed1d50f?w=800&q=80",
  "Milk Boiler": "https://images.unsplash.com/photo-1588416820614-f8d6ac6cea56?w=800&q=80",
  "Milk Container": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80",
  "Muffin Tray": "https://images.unsplash.com/photo-1647617587049-559e8ae530e6?w=800&q=80",
  "Paring Knife": "https://images.unsplash.com/photo-1596633609591-e4e1e9e06b7f?w=800&q=80",
  "Peeler": "https://images.unsplash.com/photo-1623707430647-d81f3f0b4a4b?w=800&q=80",
  "Pressure Cooker": "https://images.unsplash.com/photo-1588416820614-f8d6ac6cea56?w=800&q=80",
  "Quarter Plate": "https://images.unsplash.com/photo-1518184961573-4474fec952df?w=800&q=80",
  "Rice Server": "https://images.unsplash.com/photo-1589805119904-b829408eff83?w=800&q=80",
  "Saucepan": "https://images.unsplash.com/photo-1511224931379-b4e4324ea7fc?w=800&q=80",
  "Serving Bowl": "https://images.unsplash.com/photo-1529517986296-847580704921?w=800&q=80",
  "Serving Spoon": "https://images.unsplash.com/photo-1589805119904-b829408eff83?w=800&q=80",
  "Serving Tongs": "https://images.unsplash.com/photo-1678375722686-c7ea507c3003?w=800&q=80",
  "Serving Tray": "https://images.unsplash.com/photo-1711153419402-336ee48f2138?w=800&q=80",
  "Skimmer": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80",
  "Slotted Spoon": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80",
  "Spice Box (Masala Dabba)": "https://images.unsplash.com/photo-1771541897176-44a3e01dc484?w=800&q=80",
  "Spoon (Table)": "https://images.unsplash.com/photo-1589805119904-b829408eff83?w=800&q=80",
  "Stock Pot": "https://images.unsplash.com/photo-1571266313385-20c0cb974641?w=800&q=80",
  "Storage Container Large": "https://images.unsplash.com/photo-1592824555364-48a8ca0f0caf?w=800&q=80",
  "Storage Container Medium": "https://images.unsplash.com/photo-1592824555364-48a8ca0f0caf?w=800&q=80",
  "Storage Container Small": "https://images.unsplash.com/photo-1592824555364-48a8ca0f0caf?w=800&q=80",
  "Strainer": "https://images.unsplash.com/photo-1716051164589-b2f4d9b228dc?w=800&q=80",
  "Tawa": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80",
  "Tongs": "https://images.unsplash.com/photo-1678375722686-c7ea507c3003?w=800&q=80",
  "Tope (Patila)": "https://images.unsplash.com/photo-1589557944589-c1d0eaabc88e?w=800&q=80",
  "Turner/Spatula": "https://images.unsplash.com/photo-1678375722686-c7ea507c3003?w=800&q=80",
  "Vegetable Slicer": "https://images.unsplash.com/photo-1623707430647-d81f3f0b4a4b?w=800&q=80",
  "Water Bottle": "https://images.unsplash.com/photo-1625708458528-802ec79b1ed8?w=800&q=80",
  "Whisk": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80",
  "Wok": "https://images.unsplash.com/photo-1672562710391-01284d39e878?w=800&q=80"
};

async function testOne(name, url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ name, status: res.statusCode, url });
    }).on('error', (e) => resolve({ name, error: e.message, url }));
  });
}

async function verifyAll() {
  const keys = Object.keys(candidates);
  console.log(`Checking ${keys.length} items...`);
  const failures = [];
  for (const k of keys) {
    const res = await testOne(k, candidates[k]);
    if (res.status !== 200) {
      console.log(`❌ ${k} failed with status: ${res.status || res.error}`);
      failures.push(res);
    } else {
      console.log(`✅ ${k}`);
    }
  }
  console.log(`\nResults: ${keys.length - failures.length}/${keys.length} passed.`);
}

verifyAll();
