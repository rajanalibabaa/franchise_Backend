// db.js
import mongoose from "mongoose";
import dns from "dns";

// 🔧 FIX DNS Resolution Issues
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Use Google DNS

const connectDatabase = async () => {
  const maxRetries = 5;
  let retries = 0;

  const connect = async () => {
    try {
      if (!process.env.DB_URL) {
        throw new Error("DB_URL is not defined in .env file");
      }

      console.log("🔄 Attempting MongoDB connection...");
      console.log(`📍 Database URL: ${process.env.DB_URL.split("@")[1]}`); // Log without credentials

      // Configure mongoose with aggressive retry settings
      const conn = await mongoose.connect(process.env.DB_URL, {
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 15000, // Increased timeout
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        retryWrites: true,
        retryReads: true,
        // Force IPv4
        family: 4,
      });

      console.log(`✅ MongoDB connected successfully!`);
      console.log(`   Database: ${conn.connection.name}`);
      console.log(`   Host: ${conn.connection.host}`);

      return true;
    } catch (err) {
      retries++;
      console.error(
        `\n❌ MongoDB connection failed (Attempt ${retries}/${maxRetries}):`
      );
      console.error(`   Error: ${err.message}`);
      console.error(`   Code: ${err.code}`);

      // Detailed troubleshooting for DNS/Connection issues
      if (
        err.message.includes("querySrv ECONNREFUSED") ||
        err.message.includes("ECONNREFUSED") ||
        err.code === "ECONNREFUSED"
      ) {
        console.error("\n⚠️  CONNECTION REFUSED - TROUBLESHOOTING::");
        console.error("   1️⃣  Check your internet connection is working");
        console.error("   2️⃣  Verify IP is whitelisted in MongoDB Atlas:");
        console.error("       🌐 https://cloud.mongodb.com/");
        console.error("       → Network Access → Add IP Address");
        console.error("   3️⃣  Try adding your current IP: 0.0.0.0/0 (allow all)");
        console.error("       ⚠️  (Security risk - use specific IPs in production)");
        console.error("   4️⃣  Delete and recreate the connection string");
        console.error("   5️⃣  Check firewall/VPN settings blocking MongoDB");
      }

      if (err.message.includes("querySrv") || err.message.includes("ENOTFOUND")) {
        console.error("\n🔧 DNS RESOLUTION FAILED:");
        console.error("   → Network may be blocking DNS lookups");
        console.error("   → Check your ISP/Router/Firewall settings");
      }

      if (retries < maxRetries) {
        console.log(`\n⏳ Retrying in ${retries * 2} seconds... (Attempt ${retries}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, retries * 2000)); // Progressive backoff
        return connect();
      }

      // Exit after max retries
      console.error(
        "\n❌ =========================================="
      );
      console.error(
        "❌ Max retries reached. MongoDB connection failed."
      );
      console.error(
        "❌ =========================================="
      );
      console.error("\n💡 QUICK FIX STEPS:");
      console.error("   1. Go to https://cloud.mongodb.com/");
      console.error("   2. Click on 'Network Access' (or 'Security')");
      console.error("   3. Click 'Add IP Address'");
      console.error("   4. Enter: 0.0.0.0/0 (for testing)");
      console.error("   5. Restart the server");
      console.error("\n");
      process.exit(1);
    }
  };

  return connect();
};

export default connectDatabase;
