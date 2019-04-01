export class Scrollbar {
	constructor() {
		let _ = this;

		_.channelsWrapper = document.querySelector(".channels-wrapper");
		_.channelsContent = _.channelsWrapper.querySelector(".channels-content");
		_.channelsContainer = _.channelsWrapper.querySelector(".channels");
		_.scrollContainer = document.querySelector(".scroll");
		_.scrollbar = _.scrollContainer.querySelector(".scrollbar");
		_.scrollStep = 75;
		_.isDragged = false;

		_.setScrollbarHeight();
		_.onMouseAction();
		_.onTouchAction();

		window.onResizeEnd(() => {
			_.setScrollbarHeight();
		});
	}

	setScrollbarHeight() {
		let _ = this;
		_.scrollbar.style.height = parseInt(
			_.channelsContent.offsetHeight ** 2 /
			_.channelsContent.scrollHeight
		) + "px";
	}

	onMouseAction() {
		let _ = this;

		_.scrollbar.addEventListener("mousedown", (event) => {
			event.preventDefault();

			if (event.which === 3) return;

			let scrollbarPosY = _.scrollbar.offsetTop;
  			let initMousePosY = event.pageY;

			_.isDraggedClass(true);

			document.addEventListener("mousemove", (event) => {
				if (!_.isDragged) return;

				let mousePosY = event.pageY;
				let topEdge = Math.max(0, scrollbarPosY + mousePosY - initMousePosY);
				let bottomEdge = _.scrollContainer.offsetHeight - _.scrollbar.offsetHeight;

				_.scrollbar.style.top = Math.min(topEdge, bottomEdge) + "px";
				_.channelsContent.scrollTop = _.channelsContent.scrollHeight *
											  _.scrollbar.offsetTop /
											  _.channelsWrapper.offsetHeight;
			});

			document.addEventListener("mouseup", () => {
				if (!_.isDragged) return;

				_.isDraggedClass(false);
			});
		});

		_.channelsWrapper.addEventListener("wheel", (event) => {
			_.scrollContent(event.deltaY, 0);
		});
	}

	onTouchAction() {
		let _ = this;
		let touchStartPoint;
		let touchMovePoint;

		_.channelsWrapper.addEventListener("touchstart", (event) => {
			_.isDraggedClass(true);

			touchStartPoint = event.touches[0].clientY;
		});

		document.addEventListener("touchmove", (event) => {
			if (!_.isDragged) return;

			touchMovePoint = event.touches[0].clientY;

			_.scrollContent(touchStartPoint, touchMovePoint);

			touchStartPoint = touchMovePoint;
		});

		document.addEventListener("touchend", (event) => {
			if (!_.isDragged) return;

			_.isDraggedClass(false);
		});

	}

	isDraggedClass(bool) {
		let _ = this;

		_.isDragged = bool;

		if (bool) _.scrollContainer.classList.add("is-dragged");
		else _.scrollContainer.classList.remove("is-dragged");
	}

	scrollContent(position1, position2) {
		let _ = this;

		if (position1 > position2) {
			_.channelsContent.scrollTop = _.channelsContent.scrollTop +
										  _.scrollStep;
		}

		if (position1 < position2) {
			_.channelsContent.scrollTop = _.channelsContent.scrollTop -
										  _.scrollStep;
		}

		_.scrollbar.style.top = Math.ceil(
			_.channelsWrapper.offsetHeight *
			_.channelsContent.scrollTop /
			_.channelsContent.scrollHeight
		) + "px";
	}
}