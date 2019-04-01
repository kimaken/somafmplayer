window.onResizeEnd = (cb) => {
	let resizeTimer;

	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer);

		resizeTimer = setTimeout(() => {

			cb();

		}, 100);
	});
}