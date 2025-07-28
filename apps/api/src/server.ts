import app from "./index";

const server = Bun.serve(app);

// Custom console output mit richtiger Host-Info
console.log(`🚀 Started development server:`);
console.log(`   ➜ Local:   http://localhost:${server.port}`);
console.log(`   ➜ Network: http://${server.hostname}:${server.port}`);

if (server.hostname === "0.0.0.0") {
  console.log(`   ➜ Access from other devices: http://192.168.178.60:${server.port}`);
}

console.log(`   ➜ Environment: ${process.env.NODE_ENV || "development"}`);