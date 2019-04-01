import {Scrollbar} from "./scrollbar.js";
import preloader from "../../images/preloader.svg";

export class Channels {
	constructor() {
		let _ = this;

		_.app = document.querySelector("#app");
		_.wrapper = document.querySelector(".wrapper");
		_.channelsWrapper = document.querySelector(".channels-wrapper");
		_.channelsContainer = document.querySelector(".channels"),
		_.channelsButton = document.querySelector(".channels-button");
		_.channels = document.createDocumentFragment();
		_.channelDataObj = {};

		_.getChannelsData();
		_.toggleChannels();
	}

	get channelData() {
		let _ = this;

		return _.channelDataObj;
	}

	getChannelsData() {
		fetch("https://api.somafm.com/channels.json")
		.then((response) => response.json())
		.then((data) => {
			let _ = this;

			for (let i = 0; i < data.channels.length; i++) {
				let channelID = data.channels[i].id,
					channelTitle = data.channels[i].title,
					channelDescription = data.channels[i].description,
					channelGenre = data.channels[i].genre,
					channelImage = data.channels[i].xlimage,
					channelCurrentTrack = data.channels[i].lastPlaying,
					channelURL =`http://ice1.somafm.com/${channelID}-128-mp3`,
					channel = document.createElement("div"),
					channelHTML =  `<div class="inner">
										<div class="image" style="background-image: url(${preloader});">
											<img alt="${channelID}" src="${channelImage}">
										</div>
										<div class="info">
											<div class="title">${channelTitle}</div>
											<div class="genre">${channelGenre}</div>
										</div>
										<button class="play-button"></button>
									</div>`;
				channel.innerHTML = channelHTML;
				channel.classList.add("channel");
				channel.setAttribute("id", channelID);
				_.channels.appendChild(channel);
				_.channelDataObj[channelID] = {
					channelID,
					channelTitle,
					channelDescription,
					channelGenre,
					channelImage,
					channelCurrentTrack,
					channelURL
				};
			}

			_.channelsContainer.appendChild(this.channels);
		})
		.then(() => {
			let _ = this;

			if (window.innerWidth > 1024) {
				let scrollbar = new Scrollbar();
			}

			_.onImageLoad();
			document.querySelector("#app").classList.remove("loading");
		})
		.catch((err) => console.error(err));
	}

	onImageLoad() {
		let _ = this;
		let images = _.channelsContainer.querySelectorAll(".channel .image img");

		images.forEach((item) => {
			item.addEventListener("load", () => {
				if (item.complete) item.parentElement.classList.add("loaded");
			});
		});
	}

	getChannelTracks(channel) {
		return fetch(`https://api.somafm.com/songs/${channel}.json`)
		.then((response) => response.json())
		.then((data) => {
			return data.songs;
		})
		.catch((err) => console.error(err));
	}

	isOpenedClass(el, bool) {
		for (let i = 0; i < el.length; i++) {
			if (bool) el[i].classList.add("is-opened");
			else el[i].classList.remove("is-opened");
		}
	}

	openChannels() {
		let _ = this;
		let position = _.channelsWrapper.offsetWidth;

		_.isOpened = true;

		_.isOpenedClass([_.channelsButton, _.channelsWrapper, _.app], true);
	}

	closeChannels() {
		let _ = this;

		_.isOpened = false;

		_.isOpenedClass([_.channelsButton, _.channelsWrapper, _.app], false);
	}

	toggleChannels() {
		let _ = this;

		_.isOpened = false;

		_.channelsButton.addEventListener("click", () => {
			if (!_.isOpened) {
				_.openChannels();
			}
			else {
				_.closeChannels();
			}
		});
	}
}