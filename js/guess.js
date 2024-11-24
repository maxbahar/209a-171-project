class Slider {

    constructor(sliderId) {
        this.sliderId = sliderId;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // grab slider location in your DOM
        vis.slider = document.getElementById(vis.sliderId);

        // define slider functionality - notice that you need to provide the slider's location
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

        // attach an event listener to the slider
        slider.noUiSlider.on('slide', function (values) {

            console.log(values);
            userGuess = values[0];
            document.getElementById("user-guess").innerText = userGuess.toLocaleString();

        });
    }
}
