// ========================================
// CHARLES' LAW DATA ANALYZER
// VERSION 1A
// ========================================


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


    // Collect readings
    for (let i = 1; i <= 3; i++) {

        const temperature =
            parseFloat(
                document.getElementById(`temp${i}`).value
            );

        const height =
            parseFloat(
                document.getElementById(`height${i}`).value
            );


        // Check temperature
        if (Number.isNaN(temperature)) {

            showValidationError(
                `Please enter the temperature for Reading ${i}.`
            );

            return;
        }


        // Check height
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
    // DATA VALID
    // ----------------------------------------

    showValidationSuccess(
        "✓ Data successfully validated."
    );


    displayDataSummary(data);


    // Move to analysis screen
    setTimeout(() => {

        showScreen("analysisScreen");

    }, 500);

}


// ----------------------------------------
// SHOW VALIDATION ERROR
// ----------------------------------------

function showValidationError(message) {

    const validationMessage =
        document.getElementById("validationMessage");

    validationMessage.textContent = "⚠️ " + message;

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

    validationMessage.textContent = message;

    validationMessage.classList.remove("hidden");

    validationMessage.classList.add(
        "validation-success"
    );

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
