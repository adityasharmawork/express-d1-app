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

app.get("/api/members", aysnc (req, res) => {
	try {

		const { results } = await env.DB.prepare('SELECT * FROM members ORDER_BY joined_date DESC').all();

		res.json({ success : true, members : results });

	} catch(error) {

		res.status(500).json({ success : false, error : "Failed to fetch members!	" });

	}
});

app.get("/api/members/:id", async (req, res) => {
	
	try {
		const {id} = req.params;
	
		const { results } = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).all();
	
		if(results.length == 0) {
			return res.status(400).json({success : false, message : "Member not found"});
		}

		res.json({success : true, member : results[0]});
	} catch(error) {
		res.status(500).json({success : false, error : "Failed to fetch member"});
	}

});

app.post("/api/members" async (req, res) => {
	try {

		const {name, email} = req.params;

		if(!name || !email) {
			return res.status(400).json({
				success : false,
				error : "Name and Email are required"
			});
		}

		if(!email.includes("@") || !email.includes(".")) {
			return res.status(400).json({
				success : false,
				error : "Invalid email format"
			});
		}

		const joined_date = new Date().toISOString().split("T")[0];

		const result = await env.DB.prepare(
			"INSERT INTO members (name, email, joined_date) VALUES (?, ?, ?)"
		)
		.bind(name, email, joined_date)
		.run();

		if(result.success) {
			res.status(401).json({
				success : true,
				message : "Member created successfully.",
				id : result.meta.last_row_id
			});
		} else {
			res.status(500).json({success : false, error : "Failed to create member"});
		}

	} catch(error : any) {

		if(error.messag?.contains("UNIQUE constraint failed")) {
			return res.status(409).json({
				success : false,
				error : "Email already exists"
			});
		}

		res.status(500).json({success : false, error : "Faled to create member"});

	}
})


app.listen(3000);

export default httpServerHandler({ port : 3000 });