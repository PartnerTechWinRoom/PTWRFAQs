//Making changes to SQL now, change
// Azure Table Storage configuration
const tableName = "PTWQnA"; // Replace with your Azure Table name
const accountName = "ptwdatafile"; // Replace with your Azure Storage account name
const sasToken = "sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-03-31T17:14:37Z&st=2025-03-18T09:14:37Z&spr=https,http&sig=9IF6qfz5%2FCNORi8DHobgpVEMLl72tBEH%2B8RMpBlxv%2BU%3D"; // Replace with your SAS token
const endpoint = `https://${accountName}.table.core.windows.net/${tableName}?${sasToken}`; // Construct the Azure Table endpoint URL

/**
 * Fetch data from Azure Table Storage.
 * @returns {Promise<Array>} The array of data objects fetched from the table.
 */
async function fetchData() {
    // Specify the fields to fetch from the table
    const selectedFields = "$select=_Area,_Question,_Answer";
    // Uncomment the next line to add sorting by _Area in ascending order
    // const orderByField = "$orderby=_Area asc";
    const urlWithSelectAndOrderBy = `${endpoint}&${selectedFields}`; // Construct the query URL

    console.log("Endpoint URL with $select and $orderby: ", urlWithSelectAndOrderBy);

    // Make the HTTP GET request to fetch data
    const response = await fetch(urlWithSelectAndOrderBy, {
        method: "GET",
        headers: {
            "Accept": "application/json;odata=nometadata", // Request minimal metadata
            "Content-Type": "application/json;odata=nometadata",
            "x-ms-version": "2019-02-02" // Azure Table Storage API version
        }
    });

    // Check if the response is successful
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }

    // Parse the JSON response and return the data
    const data = await response.json();
    return data.value;
}

/**
 * Populate the HTML table with data.
 * @param {Array} data - The array of data objects to populate the table with.
 */
function populateGrid(data) {
    const grid = document.getElementById("data-table").querySelector("tbody"); // Get the table body
    grid.innerHTML = ""; // Clear existing content

    // Define the desired order of fields to display
    const fieldOrder = ["_Area", "_Question", "_Answer"];

    // Iterate over the data and create table rows
    data.forEach(item => {
        const row = document.createElement("tr");

        // Add cells in the specified order
        fieldOrder.forEach(field => {
            const cell = document.createElement("td");
            cell.textContent = item[field] || ""; // Handle missing fields gracefully
            row.appendChild(cell);
        });

        grid.appendChild(row); // Append the row to the table body
    });

    // Update the total row count in the footer
    const rowCount = data.length; // Get the total number of rows
    document.getElementById("row-count").textContent = `Total Rows: ${rowCount}`;
}

/**
 * Filter the table rows based on the input value in the specified column.
 * @param {number} columnIndex - The index of the column to filter.
 */
function filterTable(columnIndex) {
    const table = document.getElementById("data-table"); // Get the table element
    const filterInput = table.querySelectorAll("thead input")[columnIndex]; // Get the filter input for the column
    const filterValue = filterInput.value.toLowerCase(); // Get the input value in lowercase
    const rows = table.querySelectorAll("tbody tr"); // Get all table rows

    // Iterate over the rows and hide/show based on the filter value
    rows.forEach(row => {
        const cell = row.cells[columnIndex]; // Get the cell in the specified column
        if (cell) {
            const cellText = cell.textContent.toLowerCase(); // Get the cell text in lowercase
            row.style.display = cellText.includes(filterValue) ? "" : "none"; // Show/hide the row
        }
    });
}

// Event listener to fetch and populate data when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = await fetchData(); // Fetch data from Azure Table Storage
        console.log("Fetched data:", data);
        if (data && data.length > 0) {
            populateGrid(data); // Populate the table with fetched data
        } else {
            console.warn("No data available to populate the grid.");
        }
    } catch (error) {
        console.error("Error fetching data:", error); // Log any errors
    }
});