const deviceTableBody = document.getElementById("device-table-body");

var deviceCounter = 0;

function loadExisting() {
    // get list of existing devices from server and call addDeviceRow for each
}

function addDeviceRow(id, device) {
    let row = document.createElement("tr");

    if (!id) {
        addNewInputCell("text", "id", id, "table-heading-id");
    }
    else {
        addNewStaticCell(id);
    }

    addNewInputCell("text", "name-" + deviceCounter, device.name, "table-heading-name");
    addNewInputCell("number", "width-" + deviceCounter, device.width, "table-heading-width");
    addNewInputCell("number", "height-" + deviceCounter, device.height, "table-heading-height");
    addNewInputCell("checkbox", "preferbmp-" + deviceCounter, device.prefer_bmp, "table-heading-preferbmp");
    addNewInputCell("number", "grayscale-" + deviceCounter, device.grayscale_depth, "table-heading-grayscale");
    addNewInputCell("number", "color-" + deviceCounter, device.color_depth, "table-heading-color");
    addNewInputCell("text", "url-" + deviceCounter, device.url, "table-heading-url");

    addNewStaticCell(device.api_key);
    
    deviceCounter++;
    deviceTableBody.appendChild(row);

    function addNewStaticCell(value) {
        let cell = document.createElement("td");
        cell.innerHTML = `
            <span>${value}</span>
        `;
        row.appendChild(cell);
    }

    function addNewInputCell(inputType, fieldName, value, colHeadId) {
        let cell = document.createElement("td");
        cell.innerHTML = `
            <input type="${inputType}"
                name="${fieldName}"
                value="${value}"
                aria-labelledby="${colHeadId}">
        `;

        row.appendChild(cell);
    }
}

function resetDeviceTable() {
    deviceTableBody.replaceChildren();
    deviceCounter = 0;
}

function addNewDevice() {
    addDeviceRow("", {
        name: "New Device",
        width: 800,
        height: 480,
        prefer_bmp: false,
        grayscale_depth: 4,
        color_depth: 0,
        url: constants.WELCOME_PAGE_ABS_URL,
        api_key: ""
    });
}

function validateRow() {

}