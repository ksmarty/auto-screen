require("esbuild")
	.build({
		entryPoints: ["src/index.ts"],
		bundle: true,
		minify: true,
		platform: "node",
		external: ["electron/*", "ws", "*.png"],
		outfile: "dist/auto-screen.js",
	})
	.catch(() => process.exit(1))
	.then(() => console.log("Done!"));
