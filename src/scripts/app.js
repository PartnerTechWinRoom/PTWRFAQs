const tableName = "PTWQnA"; // Replace with your Azure Table name
const accountName = "ptwdatafile"; // Replace with your Azure Storage account name
const sasToken = "sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-03-31T17:14:37Z&st=2025-03-18T09:14:37Z&spr=https,http&sig=9IF6qfz5%2FCNORi8DHobgpVEMLl72tBEH%2B8RMpBlxv%2BU%3D"; // Replace with your SAS token
const endpoint = `https://${accountName}.table.core.windows.net/${tableName}?${sasToken}`;


async function fetchData() {
    const selectedFields = "$select=_Area,_Question,_Answer"; // Specify the fields you want to fetch
    const urlWithSelect = `${endpoint}&${selectedFields}`;

    console.log("Endpoint URL with $select: ", urlWithSelect);

    const response = await fetch(urlWithSelect, {
        method: "GET",
        headers: {
            "Accept": "application/json;odata=nometadata",
            "Content-Type": "application/json;odata=nometadata",
            "x-ms-version": "2019-02-02"
        }
    });

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.value;
}

function populateGrid(data) {
    const grid = document.getElementById("data-table").querySelector("tbody");
    grid.innerHTML = ""; // Clear existing content

    // Define the desired order of fields
    const fieldOrder = ["_Area", "_Question", "_Answer"];

    data.forEach(item => {
        const row = document.createElement("tr");

        // Add cells in the specified order
        fieldOrder.forEach(field => {
            const cell = document.createElement("td");
            cell.textContent = item[field] || ""; // Handle missing fields gracefully
            row.appendChild(cell);
        });

        grid.appendChild(row);
    });
}

function filterTable(columnIndex) {
    const table = document.getElementById("data-table");
    const filterInput = table.querySelectorAll("thead input")[columnIndex];
    const filterValue = filterInput.value.toLowerCase();
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
        const cell = row.cells[columnIndex];
        if (cell) {
            const cellText = cell.textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = await fetchData();
        console.log("Fetched data:", data);
        if (data && data.length > 0) {
            populateGrid(data);
        } else {
            console.warn("No data available to populate the grid.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});