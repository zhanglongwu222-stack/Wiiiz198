import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiBe2Og_mlU8tcMvioPUCSzw63AY7jtoE",
  authDomain: "mc-stock-market.firebaseapp.com",
  projectId: "mc-stock-market",
  storageBucket: "mc-stock-market.firebasestorage.app",
  messagingSenderId: "321839783157",
  appId: "1:321839783157:web:bb2312efafa7208e43f9bc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docStocks = doc(db, "market_data", "stocks");

export default async function handler(req, res) {
  try {
    const snap = await getDoc(docStocks);
    if (!snap.exists()) return res.status(404).send("Doc not found");

    const stockData = snap.data().list || [];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: 'Asia/Taipei' 
    });

    stockData.forEach(stock => {
      const randomPercent = (Math.random() * 0.06 - 0.03);
      const oldPrice = stock.price;
      let newPrice = parseFloat((oldPrice * (1 + randomPercent)).toFixed(1));
      if (newPrice <= 1.0) newPrice = 1.0;

      const diffPercent = (((newPrice - oldPrice) / oldPrice) * 100).toFixed(1);
      stock.isUp = newPrice >= oldPrice;
      stock.change = `${stock.isUp ? '+' : ''}${diffPercent}%`;
      stock.price = newPrice;

      if (!stock.history) stock.history = [];
      stock.history.push({ label: timeStr, value: newPrice });
      if (stock.history.length > 15) stock.history.shift();
    });

    await setDoc(docStocks, { list: stockData });
    return res.status(200).json({ success: true, updatedTime: timeStr });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
