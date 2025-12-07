// /**
//  * Welcome to Cloudflare Workers! This is your first worker.
//  *
//  * - Run `npm run dev` in your terminal to start a development server
//  * - Open a browser tab at http://localhost:8787/ to see your worker in action
//  * - Run `npm run deploy` to publish your worker
//  *
//  * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
//  * `Env` object can be regenerated with `npm run cf-typegen`.
//  *
//  * Learn more at https://developers.cloudflare.com/workers/
//  */

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		return new Response('Hello World!');
// 	},
// } satisfies ExportedHandler<Env>;





import { env } from "cloudflare:workers";
import { httpServerHandler } from  "cloudflare:node";
import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.json({message: "Express.js running on Cloudflare Workers!"});
});

app.listen(3000);

export default httpServerHandler({ port : 3000 });