import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: `https://api-ceo.sites.microlopes.pt/api/:path*`,
			},
		];
	},

	eslint: {
		// Desativa ESLint durante o build
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Ignora erros de tipo durante o build
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
