/* global sb */
module.exports = (function () {
	"use strict";

	const Express = require("express");
	const Router = Express.Router();

	const rules = sb.Utils.tag.trim `
	    <h6>Rules</h6>
		<ol>
			<li>You can only request Supibot in your own channel or someone else's channel if you are a moderator there.</li>
			<li>Your Twitch channel must not be in follower-only, subscriber-only, or any other mode that prevents people from chatting. If it is, the suggestion will be dropped. Watch out!</li>
			<li>Make sure to not accidentally ban the bot - because when it does, it will automatically leave your channel and will not come back on its own. You can 100% prevent this by modding it - it doesn't do any moderation, and it's safe to do so.</li>
			<li>If you change your name (outside of changing lower- and uppercase characters), Supibot will not track your namechange and you must request the bot again. If this is the case, you also must add your previous name to the request.</li>
			<li>Please refer to Supibot as "the bot" or "Supibot", not as "Supi". "Supi" refers to me (Supinic), and it gets very confusing sometimes 😃</li>
		</ol>
		<h6>Warning</h6>
		<div>The bot will not be added immediately! I evaluate the requests manually. It usually happens within one to seven days from the request.</div>
	`;

	Router.get("/form", async (req, res) => {
		const { userID } = await sb.WebUtils.getUserLevel(req, res);
		if (!userID) {
			return res.render("generic", {
				data: `
					<h5 class="text-center">You must log in before requesting the bot!</h5>
					<hr style="border-top: 1px solid white;">
					${rules}
				`
			});
		}

		const userData = await sb.User.get(userID ?? 1);
		res.render("generic-form", {
			prepend: sb.Utils.tag.trim `
				<h5 class="pt-3 text-center">Request Supibot in a Twitch channel</h5>
       			<div id="alert-anchor"></div>
       			${rules}
			`,
			onSubmit: "submit()",
			fields: [
				{
					id: "channel-name",
					name: "Channel name",
					type: "string",
					value: userData.Name
				},
				{
					id: "description",
					name: "Description",
					type: "memo",
					placeholder: "Short description on why you'd like the bot added 😊"
				}
			],
			script: sb.Utils.tag.trim `
				async function submit (element) {
					const button = document.getElementById("submit-button");
					button.disabled = true;
					
					const channelElement = document.getElementById("channel-name");
					const descriptionElement = document.getElementById("description");	
					const response = await fetch("/api/bot/request-bot/", {
						method: "POST",
						headers: {
						    "Content-Type": "application/json"
						},
						body: JSON.stringify({
							targetChannel: channelElement.value,
							description: descriptionElement.value || null
						})
					});
					
					const json = await response.json();
					const alerter = document.getElementById("alert-anchor");
					alerter.setAttribute("role", "alert");
					alerter.classList.remove("alert-success", "alert-danger");
					alerter.classList.add("alert");
					
					button.disabled = false;
					
					if (response.status === 200) {
						const ID = json.data.suggestionID;
						const link = "/data/suggestion/" + ID;
						alerter.innerHTML = "Success 🙂<hr>Your suggestion can be found here: <a href=" + link + ">" + ID + "</a>"; 
						alerter.classList.add("alert-success");
						
						const formWrapper = document.getElementById("form-wrapper");
						formWrapper.hidden = true;
					}
					else {
						alerter.classList.add("alert-danger");
						alerter.innerHTML = json.error.message;
					}
				}
			`
		});
	});

	return Router;
})();
