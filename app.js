/* ==========================================================
   Expense Tracker
   app.js
   Part 1
========================================================== */


/* ==========================================================
   CONFIGURATION
========================================================== */

const CONFIG = {

    submitURL:
        "https://script.google.com/macros/s/AKfycbxP9z4r3bIVGydt646OQCOq45oycl2yeuzQZ05Dp-LJQTUKWwwN6ghhi2mK3lMOH2tu0g/exec",

    configURL:
        "https://script.google.com/macros/s/AKfycbxP9z4r3bIVGydt646OQCOq45oycl2yeuzQZ05Dp-LJQTUKWwwN6ghhi2mK3lMOH2tu0g/exec?action=config",

    dashboardURL:
        "https://script.google.com/macros/s/AKfycbxP9z4r3bIVGydt646OQCOq45oycl2yeuzQZ05Dp-LJQTUKWwwN6ghhi2mK3lMOH2tu0g/exec?action=dashboard"

};


/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let dashboardData = [];

let categoryChart;

let trendChart;

let paymentChart;

let userChart;


/* ==========================================================
   SHORTCUTS
========================================================== */

const $ = (id) => document.getElementById(id);



/* ==========================================================
   DATE UTILITIES
========================================================== */

function today() {

    return new Date()
        .toISOString()
        .split("T")[0];

}

function yesterday() {

    const d = new Date();

    d.setDate(
        d.getDate() - 1
    );

    return d
        .toISOString()
        .split("T")[0];

}

function firstDayOfMonth() {

    const d = new Date();

    return new Date(
        d.getFullYear(),
        d.getMonth(),
        1
    )
    .toISOString()
    .split("T")[0];

}


/* ==========================================================
   API HELPER
========================================================== */

async function getJSON(url){

    const response =
        await fetch(url);

    if(!response.ok){

        throw new Error(
            "Unable to fetch API."
        );

    }

    return await response.json();

}



/* ==========================================================
   POPULATE DROPDOWN
========================================================== */

function populateDropdown(
    id,
    values,
    includeAll=false
){

    const dropdown = $(id);

    dropdown.innerHTML = "";

    if(includeAll){

        dropdown.innerHTML +=
        `<option value="All">
            All
        </option>`;

    }

    values.forEach(item=>{

        dropdown.innerHTML +=
        `<option value="${item}">
            ${item}
        </option>`;

    });

}



/* ==========================================================
   LOAD CONFIG
========================================================== */

async function loadConfiguration(){

    try{

        const config =
            await getJSON(
                CONFIG.configURL
            );

        populateDropdown(
            "person",
            config.users
        );

        populateDropdown(
            "category",
            config.categories
        );

        populateDropdown(
            "paymentMode",
            config.paymentModes
        );


        populateDropdown(
            "dashboardUser",
            config.users,
            true
        );

        populateDropdown(
            "dashboardCategory",
            config.categories,
            true
        );

    }

    catch(error){

        console.error(error);

        $("status").innerHTML =
        "Unable to load configuration.";

    }

}



/* ==========================================================
   DATE SELECTOR
========================================================== */

function initialiseDateSelector(){

    $("dateOption")
    .addEventListener(
        "change",
        function(){

            if(this.value==="custom"){

                $("customDate").style.display =
                    "block";

                $("customDate").required =
                    true;

            }

            else{

                $("customDate").style.display =
                    "none";

                $("customDate").required =
                    false;

            }

        }

    );

}



/* ==========================================================
   DASHBOARD FILTERS
========================================================== */

function initialiseDashboardFilters(){

    $("fromDate").value =
        firstDayOfMonth();

    $("toDate").value =
        today();

}



/* ==========================================================
   GET EXPENSE DATE
========================================================== */

function getExpenseDate(formData){

    switch(formData.dateOption){

        case "today":

            return today();

        case "yesterday":

            return yesterday();

        case "custom":

            return formData.expenseDate;

        default:

            return today();

    }

}



/* ==========================================================
   RESET FORM
========================================================== */

function resetForm(){

    $("expenseForm").reset();

    $("dateOption").value =
        "today";

    $("customDate").style.display =
        "none";

}



/* ==========================================================
   STATUS
========================================================== */

function setStatus(
    message,
    type="success"
){

    $("status").innerHTML =
        message;

    $("status").className =
        type;

}



/* ==========================================================
   INITIALISE APPLICATION
========================================================== */

window.onload = async ()=>{

    initialiseDateSelector();

    initialiseDashboardFilters();

    await loadConfiguration();

    // Part 3
    // loadDashboard();

};

/* ==========================================================
   EXPENSE FORM SUBMISSION
========================================================== */

$("expenseForm").addEventListener(
    "submit",
    submitExpense
);


/* ==========================================================
   SUBMIT EXPENSE
========================================================== */

async function submitExpense(e){

    e.preventDefault();

    try{

        toggleSaveButton(true);

        setStatus(
            "Saving expense...",
            "success"
        );

        const formData =
            Object.fromEntries(
                new FormData(
                    $("expenseForm")
                )
            );

        formData.expenseDate =
            getExpenseDate(formData);

        formData.amount =
            Number(formData.amount);

        validateExpense(formData);

        console.log("Submitting");

        console.table(formData);

        await fetch(

            CONFIG.submitURL,

            {

                method:"POST",

                mode:"no-cors",

                headers:{

                    "Content-Type":
                        "application/json"

                },

                body:JSON.stringify(
                    formData
                )

            }

        );

        setStatus(

            "✅ Expense Saved Successfully"

        );

        resetForm();

        // Refresh dashboard automatically

        setTimeout(async()=>{

            await loadDashboard();

        },700);

    }

    catch(error){

        console.error(error);

        setStatus(

            error.message,

            "error"

        );

    }

    finally{

        toggleSaveButton(false);

    }

}



/* ==========================================================
   VALIDATION
========================================================== */

function validateExpense(data){

    if(!data.person){

        throw new Error(

            "Please select user."

        );

    }

    if(!data.category){

        throw new Error(

            "Please select category."

        );

    }

    if(!data.paymentMode){

        throw new Error(

            "Please select payment mode."

        );

    }

    if(!data.expenseDate){

        throw new Error(

            "Please select expense date."

        );

    }

    if(

        data.amount===undefined ||

        data.amount===null ||

        isNaN(data.amount)

    ){

        throw new Error(

            "Invalid amount."

        );

    }

    if(data.amount<=0){

        throw new Error(

            "Amount should be greater than zero."

        );

    }

}



/* ==========================================================
   SAVE BUTTON
========================================================== */

function toggleSaveButton(disable){

    const btn =

        document.querySelector(

            "#expenseForm button"

        );

    btn.disabled = disable;

    if(disable){

        btn.innerHTML =

            "Saving...";

    }

    else{

        btn.innerHTML =

            "Save Expense";

    }

}



/* ==========================================================
   DASHBOARD REFRESH BUTTON
========================================================== */

$("refreshDashboard")
.addEventListener(

    "click",

    async ()=>{

        await loadDashboard();

    }

);



/* ==========================================================
   DASHBOARD FILTERS
========================================================== */

function getDashboardFilters(){

    return{

        fromDate:

            $("fromDate").value,

        toDate:

            $("toDate").value,

        user:

            $("dashboardUser").value,

        category:

            $("dashboardCategory").value

    };

}



/* ==========================================================
   BUILD DASHBOARD URL
========================================================== */

function buildDashboardURL(){

    const filters =

        getDashboardFilters();

    const params =

        new URLSearchParams({

            action:"dashboard",

            fromDate:filters.fromDate,

            toDate:filters.toDate,

            person:filters.user,

            category:filters.category

        });

    return(

        CONFIG.dashboardURL +

        "?" +

        params.toString()

    );

}

/* ==========================================================
   LOAD DASHBOARD
========================================================== */

async function loadDashboard() {

    try {

        const url = buildDashboardURL();

        const dashboard =
            await getJSON(url);

        dashboardData = dashboard;

        updateSummaryCards(
            dashboard.summary
        );

        populateRecentExpenses(
            dashboard.recentExpenses
        );

        drawCategoryChart(
            dashboard.categorySummary
        );

        drawTrendChart(
            dashboard.dailySummary
        );

        drawPaymentChart(
            dashboard.paymentModeSummary
        );

        drawUserChart(
            dashboard.userSummary
        );

    }

    catch(error){

        console.error(error);

        setStatus(
            "Unable to load dashboard",
            "error"
        );

    }

}



/* ==========================================================
   KPI CARDS
========================================================== */

function updateSummaryCards(summary){

    $("totalExpense").innerHTML =
        "₹" +
        Number(summary.totalExpense)
        .toLocaleString();

    $("transactionCount").innerHTML =
        summary.transactionCount;

    $("averageExpense").innerHTML =
        "₹" +
        Number(summary.averageExpense)
        .toFixed(2);

    $("highestCategory").innerHTML =
        summary.highestCategory;

}



/* ==========================================================
   RECENT TRANSACTIONS
========================================================== */

function populateRecentExpenses(rows){

    const tbody =
        $("expenseTable");

    tbody.innerHTML = "";

    if(rows.length===0){

        tbody.innerHTML =

        `<tr>

            <td colspan="6"
                style="text-align:center">

                No expenses found

            </td>

        </tr>`;

        return;

    }

    rows.forEach(row=>{

        tbody.innerHTML +=

        `<tr>

            <td>${formatDate(row.date)}</td>

            <td>${row.person}</td>

            <td>${row.category}</td>

            <td>${row.paymentMode}</td>

            <td>

                ₹${Number(row.amount)
                    .toLocaleString()}

            </td>

            <td>${row.notes || ""}</td>

        </tr>`;

    });

}



/* ==========================================================
   DATE FORMATTER
========================================================== */

function formatDate(date){

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {

                day:"2-digit",

                month:"short",

                year:"numeric"

            }

        );

}



/* ==========================================================
   FILTER CHANGES
========================================================== */

$("fromDate")
.addEventListener(
"change",
loadDashboard
);

$("toDate")
.addEventListener(
"change",
loadDashboard
);

$("dashboardUser")
.addEventListener(
"change",
loadDashboard
);

$("dashboardCategory")
.addEventListener(
"change",
loadDashboard
);



/* ==========================================================
   AUTO REFRESH
========================================================== */

setInterval(

    ()=>{

        loadDashboard();

    },

    60000

);



/* ==========================================================
   INITIAL DASHBOARD LOAD
========================================================== */

window.addEventListener(

    "load",

    ()=>{

        setTimeout(

            ()=>{

                loadDashboard();

            },

            1000

        );

    }

);



/* ==========================================================
   EXPORT TO CSV
========================================================== */

function exportCSV(){

    if(

        !dashboardData ||

        !dashboardData.recentExpenses

    ){

        return;

    }

    let csv =

    "Date,User,Category,Payment Mode,Amount,Notes\n";

    dashboardData
    .recentExpenses
    .forEach(r=>{

        csv +=

        `"${r.date}",`+

        `"${r.person}",`+

        `"${r.category}",`+

        `"${r.paymentMode}",`+

        `"${r.amount}",`+

        `"${r.notes}"\n`;

    });

    const blob =

        new Blob(

            [csv],

            {

                type:"text/csv"

            }

        );

    const url =

        URL.createObjectURL(blob);

    const a =

        document.createElement("a");

    a.href = url;

    a.download =

        "Expenses.csv";

    a.click();

}



/* ==========================================================
   SCROLL TO DASHBOARD
========================================================== */

function goToDashboard(){

    document

    .querySelector(

        ".dashboard-section"

    )

    .scrollIntoView({

        behavior:"smooth"

    });

}
