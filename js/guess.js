class Slider {
    // Handles the slider needed for the user to guess voter turnout

    constructor(sliderId) {
        this.sliderId = sliderId;
        this.initVis();
    }

    initVis() {
        let vis = this;
        console.log(userGuess);
        // Get slider location
        vis.slider = document.getElementById(vis.sliderId);

        // Define slider functionality
        noUiSlider.create(vis.slider, {
            start: userGuess,
            connect: true,
            behaviour: "tap-drag",
            step: 0.01,
            margin: 1,
            range: {
                'min': 0,
                'max': 1
            },
            tooltips: {to: (v) => v}
        });

        // Update user's guess when slider is changed
        slider.noUiSlider.on('slide', function (values) {
            userGuess = values[0];
            document.getElementById("user-guess").innerText = userGuess.toLocaleString();
        });
    }
}
