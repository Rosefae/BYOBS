const devicesForm = document.getElementById("device-config");
const deviceTableBody = document.getElementById("device-table-body");
const addDeviceBtn = document.getElementById("add-device-btn");
const devicesEndpoint = "/config/devices";

devicesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formSubmit();
});

addDeviceBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addNewDevice();
});

var deviceCounter = 0;
var existingDevices;

loadExisting();

async function loadExisting() {
    resetDeviceTable();

    try {
        const response = await fetch(devicesEndpoint);
        if (!response.ok) {
            throw new Error(`HTTP error while fetching existing device data: ${response.status}`);
        }
        const result = await response.json();

        for (const [key, value] of Object.entries(result)) {
            addDeviceRow(key, value);
        }
        existingDevices = result;
    } catch (error) {
        console.error("Failed to load device data", error);
    }
}

function addDeviceRow(id, device) {
    let row = document.createElement("tr");

    addNewDeleteCell();

    if (!id) {
        row.dataset.id = "";
        addNewInputCell("text",
            "id-" + deviceCounter,
            "",
            "table-heading-id",
            { onchange: "validateNewId(this)" }
        );
    }
    else {
        row.dataset.id = id;
        addNewStaticCell(id);
    }

    addNewInputCell("text",
        "name-" + deviceCounter,
        device.name,
        "table-heading-name"
    );
    addNewInputCell("number",
        "width-" + deviceCounter,
        device.width,
        "table-heading-width",
        { min: 1, step: 1 }
    );
    addNewInputCell("number",
        "height-" + deviceCounter,
        device.height,
        "table-heading-height",
        { min: 1, step: 1 }
    );
    addNewInputCell("checkbox",
        "preferbmp-" + deviceCounter,
        device.prefer_bmp,
        "table-heading-preferbmp"
    );
    addNewInputCell("number",
        "grayscale-" + deviceCounter,
        device.grayscale_depth,
        "table-heading-grayscale",
        { min: 1, step: 1, max: 16 }
    );
    addNewInputCell("number",
        "color-" + deviceCounter,
        device.color_depth,
        "table-heading-color",
        { min: 0, step: 1, max: 16 }
    );
    addNewInputCell("url",
        "url-" + deviceCounter,
        device.url,
        "table-heading-url"
    );

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

    function addNewInputCell(inputType, fieldName, value, colHeadId, otherAttributes) {
        let cell = document.createElement("td");
        let attributes = `type="${inputType}"
                name="${fieldName}"
                value="${value}"
                aria-labelledby="${colHeadId}"`;
        
        if (otherAttributes) {
            for (const [key, value] of Object.entries(otherAttributes)) {
                attributes += ` ${key}="${value}"`;
            }
        }
        
        cell.innerHTML = `<input ${attributes}">`;

        row.appendChild(cell);
    }

    function addNewDeleteCell() {
        let cell = document.createElement("td");
        let btn = document.createElement("button");
        btn.classList.add("delete-btn");
        btn.innerText = "Delete Device";
        btn.type = "button";
        btn.addEventListener("click", (e) => {
            deleteDevice(row);
        });
        cell.appendChild(btn);
        row.appendChild(cell);
    }
}

function resetDeviceTable() {
    deviceTableBody.replaceChildren();
    deviceCounter = 0;
}

function addNewDevice() {
    addDeviceRow(null, {
        name: "New Device",
        width: 800,
        height: 480,
        prefer_bmp: false,
        grayscale_depth: 4,
        color_depth: 0,
        url: "https://en.wikipedia.org/wiki/Main_Page",
        api_key: ""
    });
}

function validateNewId(el) {
    const id = el.value;
    let isValid = true;

    if (existingDevices.hasOwnProperty(id)) isValid = false;
    else {
        let newIdFields = deviceTableBody.querySelectorAll("input[name^='id-']");
        for (const field of newIdFields) {
            if (field !== el && field.value == id) {
                isValid = false;
                break;
            }
        }
    }

    if (!isValid) {
        el.setCustomValidity("IDs must be unique per device! It is recommended to use the device's MAC address");
    } else {
        el.setCustomValidity("");
    }
}

function deleteDevice(row) {
    row.remove();
}

async function formSubmit() {
    const rows = deviceTableBody.querySelectorAll("tr");
    let devices = {};
    
    rows.forEach((row) => {
        let id = row.dataset.id;
        if (!id) {
            id = getFieldValue(row, "id");
            devices[id] = {};
        }
        else {
            devices[id] = { ...existingDevices[id] };
        }

        let device = devices[id];
        device["name"] = getFieldValue(row, "name");
        device["width"] = getFieldValue(row, "width");
        device["height"] = getFieldValue(row, "height");
        device["prefer_bmp"] = getFieldValue(row, "preferbmp");
        device["grayscale_depth"] = getFieldValue(row, "grayscale");
        device["color_depth"] = getFieldValue(row, "color");
        device["url"] = getFieldValue(row, "url");
    });

    try {
        const response = await fetch(devicesEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(devices)
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
    } catch(error) {
        console.error("Error saving device data", error);
    }

    console.log("New device data successfully saved!");

    loadExisting();

    function getFieldValue(row, fieldName) {
        let field = row.querySelector(`input[name^="${fieldName}-"]`);
        if (field.type == "checkbox") return field.checked;
        if (field.type == "number") return parseInt(field.value);
        return field.value;
    }
}