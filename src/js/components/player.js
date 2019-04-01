import {Channels} from "./channels.js";
import {Visualiser} from "../libs/2d-audio-visualiser/visualiser.js";

export class Player {
	constructor() {
		let _ = this;

		_.app = document.querySelector("#app");
		_.channels = new Channels();
		_.channelsContainer = document.querySelector(".channels");
		_.playerWrapper = document.querySelector(".player-wrapper");
		_.playerContainer = document.querySelector(".player");
		_.currentTrack = _.playerContainer.querySelector(".current-track");
		_.artistName = _.currentTrack.querySelector(".artist");
		_.trackName = _.currentTrack.querySelector(".track");
		_.audio = new Audio();
		_.audio.crossOrigin = "anonymous";
		_.audio.volume = 1;
		_.channelElement = null;
		_.channelData = null;
		_.channelTracks = null;
		_.isInit = false;
		_.userGesture = false;

		_.loadChannel();
		_.controlPlayer();
		_.updateTrackInfo();
	}

	loadChannel() {
		let _ = this;

		_.channelsContainer.addEventListener("click", (event) => {
			let channelElement = event.target.closest(".channel");

			if (window.innerWidth > 767) {
				if (!_.userGesture) _.visualiser = new Visualiser(_.audio);
			}

			_.userGesture = true;

			if (channelElement) {
				_.channelData = _.channels.channelData[channelElement.getAttribute("id")];

				_.switchAudio(channelElement, _.channelData.channelURL);
				_.chooseChannel(channelElement);
			}
		});
	}

	async chooseChannel(channelElement) {
		let _ = this;

		if (_.channelElement) _.channelElement.classList.remove("current");
		channelElement.classList.add("current");
		_.channelElement = channelElement;

		await _.getTrackInfo(_.channelData);
		_.setChannelInfo(_.channelData);
		_.setTrackInfo();

		if (_.playerWrapper.classList.contains("empty")) {
			_.playerWrapper.classList.remove("empty");
		}
	}

	loadAudio(src) {
		let _ = this;

		_.audio.src = src;

		_.audio.addEventListener("canplay", () => {
			_.audio.play();
		});
	}

	switchAudio(channelElement, src) {
		let _ = this;

		if (_.channelElement != channelElement) {
			_.loadAudio(src);
			_.isPlayedClass([channelElement, _.app], true);
			if (_.channelElement) _.isPlayedClass([_.channelElement], false);
		}
		else {
			if (_.audio.paused) {
				_.audio.play();
				_.isPlayedClass([channelElement, _.app], true)
			}
			else {
				_.audio.pause();
				_.isPlayedClass([channelElement, _.app], false)
			}
		}
	}

	isPlayedClass(el, bool) {
		for (let i = 0; i < el.length; i++) {
			if (bool) el[i].classList.add("is-played");
			else el[i].classList.remove("is-played");
		}
	}

	setChannelInfo(channelData) {
		let _ = this;
		let image = _.playerContainer.querySelector(".image");
		let title = _.playerContainer.querySelector(".title");
		let genre = _.playerContainer.querySelector(".genre");
		let description = _.playerContainer.querySelector(".description");

		image.style.backgroundImage = `url(${channelData.channelImage})`;
		title.innerText = channelData.channelTitle;
		genre.innerText = channelData.channelGenre;
		description.innerText = channelData.channelDescription;
	}

	async getTrackInfo(channelData) {
		let _ = this;

		_.channelTracks = await _.channels.getChannelTracks(channelData.channelID);

		return _.channelTracks;
	}

	setTrackInfo() {
		let _ = this;

		_.currentTrack.innerText = _.channelTracks[0].artist + " - " + _.channelTracks[0].title;
	}

	updateTrackInfo() {
		let _ = this;

		setInterval(async () => {
			if (_.channelData) {
				await _.getTrackInfo(_.channelData);
				_.setTrackInfo();
			}
		}, 15000);
	}

	controlPlayer() {
		let _ = this,
			playButton = _.playerContainer.querySelector(".play-button"),
			prevButton = _.playerContainer.querySelector(".prev-button"),
			nextButton = _.playerContainer.querySelector(".next-button");

		_.controlVolume();

		playButton.addEventListener("click", () => {
			_.switchAudio(_.channelElement);
		});

		nextButton.addEventListener("click", () => {
			let nextChannel = _.channelsContainer.querySelector(".channel.current").nextElementSibling;

			if (!nextChannel) return;

			_.channelData = _.channels.channelData[nextChannel.getAttribute("id")];

			_.switchAudio(nextChannel, _.channelData.channelURL);
			_.chooseChannel(nextChannel);
		});

		prevButton.addEventListener("click", () => {
			let prevChannel = _.channelsContainer.querySelector(".channel.current").previousElementSibling;

			if (!prevChannel) return;

			_.channelData = _.channels.channelData[prevChannel.getAttribute("id")];

			_.switchAudio(prevChannel, _.channelData.channelURL);
			_.chooseChannel(prevChannel);
		});
	}

	controlVolume() {
		let _ = this;

		_.volume = _.playerContainer.querySelector(".volume");
		_.volumebar = _.volume.querySelector(".volumebar");
		_.mute = _.volume.querySelector(".mute");
		_.isDragged = false;
		_.isMuted = false;
		_.savedVolume = null;

		_.muteAudio();

		_.volumebar.addEventListener("mousedown", (event) => {
			event.preventDefault();

			if (event.which === 3) return;

			_.isDragged = true;
			_.volumebar.classList.add("is-dragged");
			_.isMuted = false;

			_.changeVolume(event.pageX);

			document.onmouseup = (event) => {
				if (!_.isDragged) return;

				_.isDragged = false;
				_.volumebar.classList.remove("is-dragged");

				_.changeVolume(event.pageX);
			}

			document.onmousemove = (event) => {
				if (!_.isDragged) return;

				_.changeVolume(event.pageX);
			}
		});
	}

	changeVolume(mousePosition) {
		let _ = this,
			position = mousePosition - _.volumebar.getBoundingClientRect().left,
			percentage = 100 * position / _.volumebar.clientWidth;

		if (percentage > 100) percentage = 100;
		if (percentage < 0) percentage = 0;

		_.volumebar.style.backgroundSize = `${percentage}% 100%`;
		_.audio.volume = percentage / 100;

		if (_.audio.volume === 0) {
			_.mute.classList.add("is-muted");
			_.isMuted = true;
		}
		else {
			_.mute.classList.remove("is-muted");
			_.isMuted = false;
		}
	}

	muteAudio() {
		let _ = this;

		_.mute.addEventListener("mouseup", (event) => {
			if (event.which === 3) return;

			if (!_.isMuted) {
				_.savedVolume = _.audio.volume;
				_.audio.volume = 0;
				_.isMuted = true;
				_.mute.classList.add("is-muted");
			}
			else {
				_.audio.volume = _.savedVolume;
				_.isMuted = false;
				_.mute.classList.remove("is-muted");
			}

			_.volumebar.style.backgroundSize = `${_.audio.volume * 100}% 100%`;
		});
	}
}