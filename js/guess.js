class Slider {
    // Handles the slider needed for the user to guess voter turnout

    constructor(sliderId) {
        this.sliderId = sliderId;
        this.initVis();
    }

    initVis() {
        let vis = this;
        // Get slider location
        vis.slider = document.getElementById(vis.sliderId);

        // Define slider functionality
        noUiSlider.create(vis.slider, {
            start: userGuess,
            behaviour: "tap-drag",
            step: 0.0025,
            range: {
                'min': 0,
                'max': 1
            },
            format: {
                to: (value) => value.toFixed(4), // Keep precision to 4 decimal places
                from: (value) => parseFloat(value)
            },
            // Use pctFormat for tooltips
            tooltips: {
                to: (value) => pctFormat(value), // Format slider tooltip as percentage
                from: (formattedValue) => parseFloat(formattedValue)
            }
        });

        vis.tooltip = vis.slider.querySelector('.noUi-tooltip');
        vis.tooltip.classList.add("slider-not-interacted");

        // Update user's guess when slider is changed
        slider.noUiSlider.on('slide', function (values) {
            userGuess = +values[0];
            document.getElementById("user-guess").innerText = pctFormat(userGuess);
            vis.tooltip.classList.remove("slider-not-interacted");
        });
    }
}
