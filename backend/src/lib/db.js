import mongoose from "mongoose";
import dnsPromises from "dns/promises";

const resolver = new dnsPromises.Resolver();
// Use Cloudflare, Google, OpenDNS, and Quad9 to ensure maximum compatibility for DNS SRV lookups
resolver.setServers(["1.1.1.1", "8.8.8.8", "208.67.222.222", "9.9.9.9"]);

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : "";

  if (uri && uri.startsWith("mongodb+srv://")) {
    try {
      const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?#]+)(.*)/);
      if (match) {
        const [_, username, password, host, rest] = match;
        
        console.log(`Attempting custom DNS SRV lookup for host: ${host}`);
        const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
        
        if (srvRecords && srvRecords.length > 0) {
          const hostsList = srvRecords.map(r => `${r.name}:${r.port}`).join(",");
          
          // Try to fetch TXT records for additional connection options (like replica set configs)
          let txtOptions = "";
          try {
            const txtRecords = await resolver.resolveTxt(host);
            if (txtRecords && txtRecords.length > 0) {
              txtOptions = txtRecords.flat().join("&");
            }
          } catch (txtErr) {
            console.log("No TXT records found or query failed, bypassing TXT options.");
          }

          // Combine original query options with resolved TXT records
          let optionsPart = rest || "";
          if (txtOptions) {
            if (optionsPart.includes("?")) {
              optionsPart += `&${txtOptions}&ssl=true`;
            } else {
              optionsPart += `?${txtOptions}&ssl=true`;
            }
          } else {
            if (optionsPart.includes("?")) {
              optionsPart += `&ssl=true`;
            } else {
              optionsPart += `?ssl=true`;
            }
          }

          const separator = optionsPart.startsWith("/") ? "" : "/";
          const resolvedUri = `mongodb://${username}:${password}@${hostsList}${separator}${optionsPart}`;
          console.log("Successfully resolved SRV to standard mongodb URI.");
          uri = resolvedUri;
        }
      }
    } catch (dnsErr) {
      console.warn("Custom SRV DNS lookup failed. Falling back to default mongoose resolution:", dnsErr.message);
    }
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};
