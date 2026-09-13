// ========================================
// CHARLES' LAW DATA ANALYZER
// VERSION 1B
// ========================================


// ----------------------------------------
// GLOBAL DATA
// ----------------------------------------

let experimentalData = [];
let charlesLawChart = null;


// ----------------------------------------
// SCREEN NAVIGATION
// ----------------------------------------

function showScreen(screenId) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ----------------------------------------
// START EXPERIMENT
// ----------------------------------------

function startExperiment() {

    showScreen("dataScreen");

}


// ----------------------------------------
// CELSIUS → KELVIN
// ----------------------------------------

function updateKelvin(readingNumber) {

    const temperatureInput =
        document.getElementById(`temp${readingNumber}`);

    const kelvinDisplay =
        document.getElementById(`kelvin${readingNumber}`);

    const temperature =
        parseFloat(temperatureInput.value);


    if (Number.isNaN(temperature)) {

        kelvinDisplay.textContent = "—";

        return;
    }


    const kelvin = temperature + 273.15;

    kelvinDisplay.textContent =
        kelvin.toFixed(2) + " K";
}


// ----------------------------------------
// VALIDATE EXPERIMENTAL DATA
// ----------------------------------------

function validateData() {

    const validationMessage =
        document.getElementById("validationMessage");


    const data = [];


    // ----------------------------------------
    // COLLECT 3 READINGS
    // ----------------------------------------

    for (let i = 1; i <= 3; i++) {

        const temperature =
            parseFloat(
                document.getElementById(`temp${i}`).value
            );

        const height =
            parseFloat(
                document.getElementById(`height${i}`).value
            );


        // Temperature validation
        if (Number.isNaN(temperature)) {

            showValidationError(
                `Please enter the temperature for Reading ${i}.`
            );

            return;
        }


        // Height validation
        if (Number.isNaN(height)) {

            showValidationError(
                `Please enter the height of the air column for Reading ${i}.`
            );

            return;
        }


        // Height must be positive
        if (height <= 0) {

            showValidationError(
                `Height for Reading ${i} must be greater than zero.`
            );

            return;
        }


        // Celsius → Kelvin
        const kelvin = temperature + 273.15;


        data.push({

            reading: i,

            celsius: temperature,

            kelvin: kelvin,

            height: height

        });

    }


    // ----------------------------------------
    // CHECK FOR DUPLICATE TEMPERATURES
    // ----------------------------------------

    const temperatures =
        data.map(item => item.kelvin);

    const uniqueTemperatures =
        new Set(temperatures);


    if (uniqueTemperatures.size !== temperatures.length) {

        showValidationError(
            "Each reading should have a different temperature."
        );

        return;
    }


    // ----------------------------------------
    // STORE DATA
    // ----------------------------------------

    experimentalData = data;


    // ----------------------------------------
    // CALCULATE REGRESSION
    // ----------------------------------------

    const regression = calculateLinearRegression(data);

displayDataSummary(data);

displayRegressionResults(regression);

createGraph(data, regression);


    showValidationSuccess(
        "✓ Data successfully analysed."
    );


    // Move to analysis screen
    setTimeout(() => {

        showScreen("analysisScreen");

    }, 400);

}


// ----------------------------------------
// LINEAR REGRESSION
// ----------------------------------------

function calculateLinearRegression(data) {

    const n = data.length;


    // x = temperature in K
    // y = height of air column in cm

    const x =
        data.map(item => item.kelvin);

    const y =
        data.map(item => item.height);


    // ----------------------------------------
    // SUMS
    // ----------------------------------------

    const sumX =
        x.reduce((sum, value) => sum + value, 0);

    const sumY =
        y.reduce((sum, value) => sum + value, 0);

    const sumXY =
        x.reduce(
            (sum, value, index) =>
                sum + value * y[index],
            0
        );

    const sumX2 =
        x.reduce(
            (sum, value) =>
                sum + value * value,
            0
        );

    const sumY2 =
        y.reduce(
            (sum, value) =>
                sum + value * value,
            0
        );


    // ----------------------------------------
    // GRADIENT
    // ----------------------------------------

    const denominator =
        (n * sumX2) - (sumX * sumX);


    const slope =
        ((n * sumXY) - (sumX * sumY))
        /
        denominator;


    // ----------------------------------------
    // Y-INTERCEPT
    // ----------------------------------------

    const intercept =
        (sumY - slope * sumX)
        /
        n;


    // ----------------------------------------
    // PREDICTED VALUES
    // ----------------------------------------

    const predicted =
        x.map(
            value =>
                slope * value + intercept
        );


    // ----------------------------------------
    // R²
    // ----------------------------------------

    const meanY =
        sumY / n;


    const ssTotal =
        y.reduce(
            (sum, value) =>
                sum + Math.pow(value - meanY, 2),
            0
        );


    const ssResidual =
        y.reduce(
            (sum, value, index) =>
                sum +
                Math.pow(
                    value - predicted[index],
                    2
                ),
            0
        );


    const rSquared =
        1 - (ssResidual / ssTotal);


    // ----------------------------------------
    // X-INTERCEPT
    // ----------------------------------------

    let xIntercept = null;


    if (slope !== 0) {

        xIntercept =
            -intercept / slope;

    }


    return {

        slope: slope,

        intercept: intercept,

        rSquared: rSquared,

        xIntercept: xIntercept,

        predicted: predicted

    };

}


// ----------------------------------------
// DISPLAY DATA SUMMARY
// ----------------------------------------

function displayDataSummary(data) {

    const container =
        document.getElementById("dataSummary");


    let html = `

        <table class="data-table">

            <thead>

                <tr>

                    <th>Reading</th>

                    <th>°C</th>

                    <th>K</th>

                    <th>Height / cm</th>

                </tr>

            </thead>

            <tbody>

    `;


    data.forEach(item => {

        html += `

            <tr>

                <td>${item.reading}</td>

                <td>${item.celsius.toFixed(1)}</td>

                <td>${item.kelvin.toFixed(2)}</td>

                <td>${item.height.toFixed(2)}</td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML = html;

}


// ----------------------------------------
// DISPLAY REGRESSION RESULTS
// ----------------------------------------

function displayRegressionResults(regression) {

    const analysisScreen =
        document.getElementById("analysisScreen");


    // Remove previous result card
    const oldResult =
        document.getElementById("regressionResults");

    if (oldResult) {

        oldResult.remove();

    }


    const resultCard =
        document.createElement("div");

    resultCard.id =
        "regressionResults";

    resultCard.className =
        "card";


    const slope =
        regression.slope;

    const intercept =
        regression.intercept;

    const rSquared =
        regression.rSquared;

    const xIntercept =
        regression.xIntercept;


    // ----------------------------------------
    // EQUATION
    // ----------------------------------------

    const sign =
        intercept >= 0 ? "+" : "−";

    const absoluteIntercept =
        Math.abs(intercept);


    const equation =
        `H = ${slope.toFixed(5)}T ${sign} ${absoluteIntercept.toFixed(3)}`;


    resultCard.innerHTML = `

        <h2>📊 Linear Regression</h2>

        <div class="result-item">

            <span class="result-label">
                Best-fit equation
            </span>

            <strong>
                ${equation}
            </strong>

        </div>


        <div class="result-item">

            <span class="result-label">
                Gradient
            </span>

            <strong>
                ${slope.toFixed(5)} cm K⁻¹
            </strong>

        </div>


        <div class="result-item">

            <span class="result-label">
                Y-intercept
            </span>

            <strong>
                ${intercept.toFixed(3)} cm
            </strong>

        </div>


        <div class="result-item">

            <span class="result-label">
                R²
            </span>

            <strong>
                ${rSquared.toFixed(4)}
            </strong>

        </div>


        <hr>


        <h2>🌡️ Experimental Absolute Zero</h2>

        <div class="absolute-zero">

            ${
                xIntercept !== null
                ? xIntercept.toFixed(2) + " K"
                : "Unable to calculate"
            }

        </div>


        <p class="small-text">

            The experimental absolute zero is obtained by
            extrapolating the best-fit line to the point
            where the height of the air column becomes zero.

        </p>


        <div class="comparison-box">

            <div>

                <span>
                    Experimental
                </span>

                <strong>
                    ${
                        xIntercept !== null
                        ? xIntercept.toFixed(2) + " K"
                        : "—"
                    }
                </strong>

            </div>


            <div>

                <span>
                    Theoretical
                </span>

                <strong>
                    0 K
                </strong>

            </div>

        </div>

    `;


    analysisScreen.appendChild(resultCard);

}

function createGraph(data, regression) {

    const canvas = document.getElementById("charlesLawChart");

    if (!canvas) {
        console.error("Graph canvas not found.");
        return;
    }

    // Destroy previous chart
    if (charlesLawChart) {
        charlesLawChart.destroy();
    }


    // Sort experimental data by temperature
    const sortedData = [...data].sort(
        (a, b) => a.kelvin - b.kelvin
    );


    /*
     * ============================================
     * EXPERIMENTAL DATA
     * ============================================
     */

    const experimentalPoints = sortedData.map(d => ({
        x: d.kelvin,
        y: d.height
    }));


    /*
     * ============================================
     * EXPERIMENTAL BEST-FIT LINE
     * H = mT + c
     * ============================================
     */

    const minimumTemperature = 0;

    const maximumTemperature =
        Math.max(...sortedData.map(d => d.kelvin)) + 20;


    const experimentalLine = [

        {
            x: minimumTemperature,
            y:
                regression.slope * minimumTemperature
                + regression.intercept
        },

        {
            x: maximumTemperature,
            y:
                regression.slope * maximumTemperature
                + regression.intercept
        }

    ];


    /*
     * ============================================
     * THEORETICAL CHARLES' LAW LINE
     *
     * H ∝ T
     *
     * H = kT
     *
     * We use the middle experimental reading
     * as the reference point.
     * ============================================
     */

    const referencePoint =
        sortedData[Math.floor(sortedData.length / 2)];


    const theoreticalGradient =
        referencePoint.height /
        referencePoint.kelvin;


    const theoreticalLine = [

        {
            x: 0,
            y: 0
        },

        {
            x: maximumTemperature,
            y:
                theoreticalGradient *
                maximumTemperature
        }

    ];


    /*
     * ============================================
     * DETERMINE Y-AXIS RANGE
     * ============================================
     */

    const experimentalMaximum =
        Math.max(
            ...experimentalPoints.map(p => p.y)
        );

    const theoreticalMaximum =
        theoreticalGradient *
        maximumTemperature;


    const maximumHeight =
        Math.max(
            experimentalMaximum,
            theoreticalMaximum
        );


    const yAxisMaximum =
        maximumHeight * 1.15;


    /*
     * ============================================
     * CREATE CHART
     * ============================================
     */

    charlesLawChart = new Chart(canvas, {

        type: "scatter",

        data: {

            datasets: [

                /*
                 * Experimental points
                 */

                {
                    label: "Experimental data",

                    data: experimentalPoints,

                    pointRadius: 7,

                    pointHoverRadius: 9,

                    showLine: false
                },


                /*
                 * Experimental best-fit line
                 */

                {
                    label: "Experimental line",

                    data: experimentalLine,

                    type: "line",

                    fill: false,

                    pointRadius: 0,

                    borderWidth: 3,

                    tension: 0
                },


                /*
                 * Theoretical Charles' Law line
                 */

                {
                    label: "Theoretical Charles' Law",

                    data: theoreticalLine,

                    type: "line",

                    fill: false,

                    pointRadius: 0,

                    borderWidth: 3,

                    borderDash: [8, 6],

                    tension: 0
                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            interaction: {

                mode: "nearest",

                intersect: false

            },


            plugins: {

                legend: {

                    display: true,

                    position: "bottom"

                },


                tooltip: {

                    callbacks: {

                        label: function(context) {

                            const x =
                                Number(
                                    context.parsed.x
                                ).toFixed(2);

                            const y =
                                Number(
                                    context.parsed.y
                                ).toFixed(2);

                            return (
                                `${context.dataset.label}: `
                                + `(${x} K, ${y} cm)`
                            );

                        }

                    }

                }

            },


            scales: {

                x: {

                    type: "linear",

                    min: 0,

                    max: maximumTemperature,

                    title: {

                        display: true,

                        text: "Temperature / K"

                    }

                },


                y: {

                    min: 0,

                    max: yAxisMaximum,

                    title: {

                        display: true,

                        text: "Height of air column / cm"

                    }

                }

            }

        }

    });



    // Update interpretation values
    updateGraphInterpretation(regression);
}

function calculateGraphMaximumY(data, regression) {

    const experimentalMaximum =
        Math.max(...data.map(d => d.height));

    const regressionMaximum =
        regression.slope *
        Math.max(...data.map(d => d.kelvin))
        + regression.intercept;

    return Math.max(
        experimentalMaximum,
        regressionMaximum
    ) * 1.15;
}

function updateGraphInterpretation(regression) {

    const absoluteZeroElement =
        document.getElementById("graphAbsoluteZero");

    const differenceElement =
        document.getElementById("absoluteZeroDifference");


    if (absoluteZeroElement) {

        if (regression.xIntercept !== null) {

            absoluteZeroElement.textContent =
                `${regression.xIntercept.toFixed(2)} K`;

        } else {

            absoluteZeroElement.textContent =
                "Cannot be determined";

        }

    }


    if (differenceElement) {

        if (regression.xIntercept !== null) {

            const difference =
                Math.abs(regression.xIntercept);

            differenceElement.textContent =
                `${difference.toFixed(2)} K`;

        } else {

            differenceElement.textContent =
                "—";

        }

    }

}
// ----------------------------------------
// SHOW VALIDATION ERROR
// ----------------------------------------

function showValidationError(message) {

    const validationMessage =
        document.getElementById("validationMessage");


    validationMessage.textContent =
        "⚠️ " + message;


    validationMessage.classList.remove(
        "hidden",
        "validation-success"
    );

}


// ----------------------------------------
// SHOW VALIDATION SUCCESS
// ----------------------------------------

function showValidationSuccess(message) {

    const validationMessage =
        document.getElementById("validationMessage");


    validationMessage.textContent =
        message;


    validationMessage.classList.remove(
        "hidden"
    );


    validationMessage.classList.add(
        "validation-success"
    );

}
