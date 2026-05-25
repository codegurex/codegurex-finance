import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactiva el router cache para paginas dinamicas:
  // tras una mutacion (server action + revalidatePath) la siguiente
  // navegacion siempre trae data fresca, no la cacheada en cliente.
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
};

export default nextConfig;
