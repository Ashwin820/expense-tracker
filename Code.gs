/************************************************************
 * Expense Tracker Backend
 * Code.gs
 * Part 1
 ************************************************************/


/************************************************************
 * CONFIGURATION
 ************************************************************/

const EXPENSE_SHEET_ID =
  "YOUR_EXPENSE_SPREADSHEET_ID";

const CONFIG_SHEET_ID =
  "YOUR_CONFIG_SPREADSHEET_ID";


const EXPENSE_SHEET =
  "Expenses";

const USERS_SHEET =
  "Users";

const CATEGORY_SHEET =
  "Categories";

const PAYMENTMODE_SHEET =
  "Payment Modes";



/************************************************************
 * GET ROUTER
 ************************************************************/

function doGet(e) {

  try {

    const action =
      (e.parameter.action || "").toLowerCase();

    Logger.log("GET Action : " + action);

    switch (action) {

      case "config":

        return getConfiguration();

      case "dashboard":

        return getDashboard(e);

      default:

        return jsonResponse({

          success: true,

          message: "Expense Tracker API Running"

        });

    }

  }

  catch (err) {

    Logger.log(err);

    return jsonResponse({

      success: false,

      error: err.toString()

    });

  }

}



/************************************************************
 * POST ROUTER
 ************************************************************/

function doPost(e) {

  try {

    Logger.log("POST RECEIVED");

    Logger.log(e.postData.contents);

    const data =
      JSON.parse(
        e.postData.contents
      );

    const sheet =
      SpreadsheetApp
        .openById(EXPENSE_SHEET_ID)
        .getSheetByName(EXPENSE_SHEET);

    sheet.appendRow([

      new Date(data.expenseDate),

      data.person,

      data.category,

      data.paymentMode,

      Number(data.amount),

      data.notes

    ]);

    Logger.log("Expense Saved");

    return jsonResponse({

      success: true,

      message: "Expense Saved"

    });

  }

  catch (err) {

    Logger.log(err);

    return jsonResponse({

      success: false,

      error: err.toString()

    });

  }

}



/************************************************************
 * CONFIG API
 *
 * GET
 * ?action=config
 ************************************************************/

function getConfiguration() {

  const ss =
    SpreadsheetApp.openById(
      CONFIG_SHEET_ID
    );

  const users =

    readSingleColumn(

      ss.getSheetByName(
        USERS_SHEET
      )

    );

  const categories =

    readSingleColumn(

      ss.getSheetByName(
        CATEGORY_SHEET
      )

    );

  const paymentModes =

    readSingleColumn(

      ss.getSheetByName(
        PAYMENTMODE_SHEET
      )

    );

  return jsonResponse({

    users: users,

    categories: categories,

    paymentModes: paymentModes

  });

}



/************************************************************
 * READ SINGLE COLUMN
 ************************************************************/

function readSingleColumn(sheet) {

  const values =

    sheet

      .getRange(

        2,

        1,

        sheet.getLastRow() - 1,

        1

      )

      .getValues()

      .flat()

      .filter(String);

  return values;

}



/************************************************************
 * JSON RESPONSE
 ************************************************************/

function jsonResponse(data) {

  return ContentService

    .createTextOutput(

      JSON.stringify(data)

    )

    .setMimeType(

      ContentService.MimeType.JSON

    );

}

/************************************************************
 * DASHBOARD API
 *
 * GET
 * ?action=dashboard
 *
 * Filters:
 * fromDate
 * toDate
 * person
 * category
 ************************************************************/

function getDashboard(e) {

  const fromDate =
    e.parameter.fromDate || "";

  const toDate =
    e.parameter.toDate || "";

  const person =
    e.parameter.person || "All";

  const category =
    e.parameter.category || "All";

  Logger.log("Dashboard Request");

  Logger.log(
    JSON.stringify({
      fromDate,
      toDate,
      person,
      category
    })
  );

  const sheet =
    SpreadsheetApp
      .openById(EXPENSE_SHEET_ID)
      .getSheetByName(EXPENSE_SHEET);

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (values.length <= 1) {

    return jsonResponse(emptyDashboard());

  }

  const headers = values.shift();

  const expenses = values.map(row => ({

    date: row[0],

    person: row[1],

    category: row[2],

    paymentMode: row[3],

    amount: Number(row[4]),

    notes: row[5]

  }));


  /******************************************************
   APPLY FILTERS
   ******************************************************/

  const filtered = expenses.filter(expense => {

    if (fromDate) {

      if (
        new Date(expense.date) <
        new Date(fromDate)
      ) {
        return false;
      }

    }

    if (toDate) {

      const end =
        new Date(toDate);

      end.setHours(
        23,
        59,
        59,
        999
      );

      if (
        new Date(expense.date) > end
      ) {
        return false;
      }

    }

    if (

      person !== "All" &&

      expense.person !== person

    ) {

      return false;

    }

    if (

      category !== "All" &&

      expense.category !== category

    ) {

      return false;

    }

    return true;

  });


  Logger.log(

    "Filtered Records : " +

    filtered.length

  );


  /******************************************************
   SORT LATEST FIRST
   ******************************************************/

  filtered.sort(function(a, b) {

    return new Date(b.date) -

      new Date(a.date);

  });


  /******************************************************
   RETURN DATA
   ******************************************************/

  return jsonResponse({

    summary:
      calculateSummary(filtered),

    categorySummary:
      calculateCategorySummary(filtered),

    dailySummary:
      calculateDailySummary(filtered),

    paymentModeSummary:
      calculatePaymentSummary(filtered),

    userSummary:
      calculateUserSummary(filtered),

    recentExpenses:
      filtered.slice(0, 20)

  });

}



/************************************************************
 * EMPTY DASHBOARD
 ************************************************************/

function emptyDashboard() {

  return {

    summary: {

      totalExpense: 0,

      transactionCount: 0,

      averageExpense: 0,

      highestCategory: "-"

    },

    categorySummary: [],

    dailySummary: [],

    paymentModeSummary: [],

    userSummary: [],

    recentExpenses: []

  };

}

/************************************************************
 * SUMMARY (KPI CARDS)
 ************************************************************/
function calculateSummary(expenses) {

  if (expenses.length === 0) {

    return {

      totalExpense: 0,
      transactionCount: 0,
      averageExpense: 0,
      highestCategory: "-"

    };

  }

  const totalExpense =
    expenses.reduce(function(sum, expense) {

      return sum + Number(expense.amount);

    }, 0);

  const transactionCount =
    expenses.length;

  const averageExpense =
    totalExpense / transactionCount;

  const categoryTotals = {};

  expenses.forEach(function(expense) {

    if (!categoryTotals[expense.category]) {

      categoryTotals[expense.category] = 0;

    }

    categoryTotals[expense.category] +=
      Number(expense.amount);

  });

  let highestCategory = "-";
  let highestAmount = 0;

  Object.keys(categoryTotals).forEach(function(category) {

    if (categoryTotals[category] > highestAmount) {

      highestAmount =
        categoryTotals[category];

      highestCategory =
        category;

    }

  });

  return {

    totalExpense: totalExpense,

    transactionCount: transactionCount,

    averageExpense: averageExpense,

    highestCategory: highestCategory

  };

}



/************************************************************
 * CATEGORY SUMMARY
 ************************************************************/
function calculateCategorySummary(expenses) {

  const map = {};

  expenses.forEach(function(expense) {

    if (!map[expense.category]) {

      map[expense.category] = 0;

    }

    map[expense.category] +=
      Number(expense.amount);

  });

  const result = [];

  Object.keys(map).forEach(function(category) {

    result.push({

      category: category,

      amount: map[category]

    });

  });

  result.sort(function(a, b) {

    return b.amount - a.amount;

  });

  return result;

}



/************************************************************
 * PAYMENT MODE SUMMARY
 ************************************************************/
function calculatePaymentSummary(expenses) {

  const map = {};

  expenses.forEach(function(expense) {

    if (!map[expense.paymentMode]) {

      map[expense.paymentMode] = 0;

    }

    map[expense.paymentMode] +=
      Number(expense.amount);

  });

  const result = [];

  Object.keys(map).forEach(function(mode) {

    result.push({

      paymentMode: mode,

      amount: map[mode]

    });

  });

  result.sort(function(a, b) {

    return b.amount - a.amount;

  });

  return result;

}



/************************************************************
 * USER SUMMARY
 ************************************************************/
function calculateUserSummary(expenses) {

  const map = {};

  expenses.forEach(function(expense) {

    if (!map[expense.person]) {

      map[expense.person] = 0;

    }

    map[expense.person] +=
      Number(expense.amount);

  });

  const result = [];

  Object.keys(map).forEach(function(person) {

    result.push({

      person: person,

      amount: map[person]

    });

  });

  result.sort(function(a, b) {

    return b.amount - a.amount;

  });

  return result;

}



/************************************************************
 * DAILY TREND
 ************************************************************/
function calculateDailySummary(expenses) {

  const map = {};

  expenses.forEach(function(expense) {

    const date = Utilities.formatDate(

      new Date(expense.date),

      Session.getScriptTimeZone(),

      "yyyy-MM-dd"

    );

    if (!map[date]) {

      map[date] = 0;

    }

    map[date] +=
      Number(expense.amount);

  });

  const result = [];

  Object.keys(map)
    .sort()
    .forEach(function(date) {

      result.push({

        date: date,

        amount: map[date]

      });

    });

  return result;

}

/************************************************************
 * CACHE CONFIGURATION
 ************************************************************/

function getCachedConfiguration() {

  const cache = CacheService.getScriptCache();

  const cached = cache.get("expense_config");

  if (cached) {

    Logger.log("Configuration loaded from cache");

    return JSON.parse(cached);

  }

  const ss = SpreadsheetApp.openById(CONFIG_SHEET_ID);

  const config = {

    users: readSingleColumn(
      ss.getSheetByName(USERS_SHEET)
    ),

    categories: readSingleColumn(
      ss.getSheetByName(CATEGORY_SHEET)
    ),

    paymentModes: readSingleColumn(
      ss.getSheetByName(PAYMENTMODE_SHEET)
    )

  };

  cache.put(
    "expense_config",
    JSON.stringify(config),
    3600
  );

  Logger.log("Configuration loaded from spreadsheet");

  return config;

}



/************************************************************
 * CLEAR CONFIG CACHE
 ************************************************************/

function clearConfigurationCache() {

  CacheService
    .getScriptCache()
    .remove("expense_config");

}



/************************************************************
 * VALIDATE EXPENSE
 ************************************************************/

function validateExpense(data) {

  if (!data.person)
    throw new Error("User is mandatory.");

  if (!data.category)
    throw new Error("Category is mandatory.");

  if (!data.paymentMode)
    throw new Error("Payment Mode is mandatory.");

  if (!data.expenseDate)
    throw new Error("Expense Date is mandatory.");

  if (
    data.amount === "" ||
    data.amount === null ||
    data.amount === undefined
  ) {
    throw new Error("Amount is mandatory.");
  }

  if (Number(data.amount) <= 0) {

    throw new Error(
      "Amount should be greater than zero."
    );

  }

}



/************************************************************
 * GET EXPENSE SHEET
 ************************************************************/

function getExpenseSheet() {

  return SpreadsheetApp

    .openById(EXPENSE_SHEET_ID)

    .getSheetByName(EXPENSE_SHEET);

}



/************************************************************
 * GET CONFIG SPREADSHEET
 ************************************************************/

function getConfigSpreadsheet() {

  return SpreadsheetApp

    .openById(CONFIG_SHEET_ID);

}



/************************************************************
 * LOG EXECUTION TIME
 ************************************************************/

function logExecutionTime(startTime, process) {

  const seconds =

    ((new Date()) - startTime) / 1000;

  Logger.log(

    process +

    " completed in " +

    seconds +

    " seconds"

  );

}



/************************************************************
 * SAFE NUMBER
 ************************************************************/

function safeNumber(value) {

  if (

    value === null ||

    value === "" ||

    value === undefined

  ) {

    return 0;

  }

  return Number(value);

}



/************************************************************
 * FORMAT DATE
 ************************************************************/

function formatDate(date) {

  return Utilities.formatDate(

    new Date(date),

    Session.getScriptTimeZone(),

    "yyyy-MM-dd"

  );

}



/************************************************************
 * TEST CONFIG API
 ************************************************************/

function testConfig() {

  Logger.log(

    JSON.stringify(

      getCachedConfiguration(),

      null,

      2

    )

  );

}



/************************************************************
 * TEST DASHBOARD
 ************************************************************/

function testDashboard() {

  const fakeEvent = {

    parameter: {

      fromDate: "2026-01-01",

      toDate: "2026-12-31",

      person: "All",

      category: "All"

    }

  };

  Logger.log(

    getDashboard(fakeEvent)

      .getContent()

  );

}



/************************************************************
 * TEST INSERT
 ************************************************************/

function testInsert() {

  const fakeEvent = {

    postData: {

      contents:

      JSON.stringify({

        expenseDate: "2026-07-04",

        person: "You",

        category: "Food",

        paymentMode: "UPI",

        amount: 250,

        notes: "Test Entry"

      })

    }

  };

  Logger.log(

    doPost(fakeEvent)

      .getContent()

  );

}



/************************************************************
 * VERSION
 ************************************************************/

function version() {

  Logger.log(

    "Expense Tracker Backend v1.0"

  );

}
