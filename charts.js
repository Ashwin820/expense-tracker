/* ==========================================================
   Expense Tracker
   charts.js
   Part 1
========================================================== */


/* ==========================================================
   CHART.JS GLOBAL SETTINGS
========================================================== */

Chart.defaults.font.family =
    "'Segoe UI', Arial, sans-serif";

Chart.defaults.font.size = 13;

Chart.defaults.plugins.legend.position = "bottom";

Chart.defaults.plugins.legend.labels.usePointStyle = true;

Chart.defaults.plugins.legend.labels.padding = 18;

Chart.defaults.plugins.tooltip.cornerRadius = 10;

Chart.defaults.plugins.tooltip.padding = 12;

Chart.defaults.animation.duration = 800;

Chart.defaults.responsive = true;

Chart.defaults.maintainAspectRatio = false;


/* ==========================================================
   COLOUR PALETTE
========================================================== */

const chartColours = [

    "#4F46E5",
    "#06B6D4",
    "#16A34A",
    "#F59E0B",
    "#DC2626",
    "#8B5CF6",
    "#14B8A6",
    "#EC4899",
    "#84CC16",
    "#F97316",
    "#6366F1",
    "#0EA5E9"

];


/* ==========================================================
   DESTROY CHART
========================================================== */

function destroyChart(chart){

    if(chart){

        chart.destroy();

    }

}


/* ==========================================================
   FORMAT CURRENCY
========================================================== */

function formatCurrency(value){

    return "₹" +

    Number(value)

    .toLocaleString(

        "en-IN",

        {

            maximumFractionDigits:0

        }

    );

}


/* ==========================================================
   CATEGORY SPENDING
========================================================== */

function drawCategoryChart(data){

    destroyChart(categoryChart);

    const ctx =

        document

        .getElementById(

            "categoryChart"

        )

        .getContext("2d");

    categoryChart =

        new Chart(

            ctx,

            {

                type:"doughnut",

                data:{

                    labels:

                        data.map(

                            x=>x.category

                        ),

                    datasets:[

                        {

                            data:

                                data.map(

                                    x=>x.amount

                                ),

                            backgroundColor:

                                chartColours,

                            borderWidth:2,

                            borderColor:"#fff",

                            hoverOffset:18

                        }

                    ]

                },

                options:{

                    cutout:"65%",

                    plugins:{

                        title:{

                            display:false

                        },

                        tooltip:{

                            callbacks:{

                                label:function(context){

                                    return (

                                        context.label +

                                        " : " +

                                        formatCurrency(

                                            context.raw

                                        )

                                    );

                                }

                            }

                        }

                    }

                }

            }

        );

}


/* ==========================================================
   DAILY TREND
========================================================== */

function drawTrendChart(data){

    destroyChart(trendChart);

    const ctx =

        document

        .getElementById(

            "trendChart"

        )

        .getContext("2d");

    trendChart =

        new Chart(

            ctx,

            {

                type:"line",

                data:{

                    labels:

                        data.map(

                            x=>x.date

                        ),

                    datasets:[

                        {

                            label:"Daily Spend",

                            data:

                                data.map(

                                    x=>x.amount

                                ),

                            borderColor:

                                "#4F46E5",

                            backgroundColor:

                                "rgba(79,70,229,.15)",

                            fill:true,

                            tension:.35,

                            pointRadius:5,

                            pointHoverRadius:7,

                            pointBackgroundColor:

                                "#4F46E5"

                        }

                    ]

                },

                options:{

                    scales:{

                        y:{

                            beginAtZero:true,

                            ticks:{

                                callback:function(value){

                                    return "₹"+value;

                                }

                            }

                        }

                    },

                    plugins:{

                        tooltip:{

                            callbacks:{

                                label:function(context){

                                    return formatCurrency(

                                        context.raw

                                    );

                                }

                            }

                        }

                    }

                }

            }

        );

}
/* ==========================================================
   PAYMENT MODE PIE CHART
========================================================== */

function drawPaymentChart(data) {

    destroyChart(paymentChart);

    const canvas =
        document.getElementById("paymentChart");

    if (!canvas) return;

    if (!data || data.length === 0) {

        showEmptyChart(canvas, "No Payment Data");

        return;

    }

    const ctx = canvas.getContext("2d");

    paymentChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels:
                data.map(x => x.paymentMode),

            datasets: [{

                data:
                    data.map(x => Number(x.amount)),

                backgroundColor:
                    chartColours,

                borderColor: "#ffffff",

                borderWidth: 2

            }]

        },

        options: {

            plugins: {

                legend: {

                    position: "bottom"

                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return context.label +
                                " : " +
                                formatCurrency(context.raw);

                        }

                    }

                }

            }

        }

    });

}



/* ==========================================================
   USER SPENDING BAR CHART
========================================================== */

function drawUserChart(data) {

    destroyChart(userChart);

    const canvas =
        document.getElementById("userChart");

    if (!canvas) return;

    if (!data || data.length === 0) {

        showEmptyChart(canvas, "No User Data");

        return;

    }

    const ctx =
        canvas.getContext("2d");

    userChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels:
                data.map(x => x.person),

            datasets: [{

                label: "Expense",

                data:
                    data.map(x => Number(x.amount)),

                backgroundColor: [

                    "#4F46E5",

                    "#06B6D4",

                    "#16A34A",

                    "#F59E0B"

                ],

                borderRadius: 10,

                borderSkipped: false

            }]

        },

        options: {

            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return formatCurrency(

                                context.raw

                            );

                        }

                    }

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        callback: function(value) {

                            return "₹" + value;

                        }

                    }

                }

            }

        }

    });

}



/* ==========================================================
   SHOW EMPTY CHART MESSAGE
========================================================== */

function showEmptyChart(canvas, message) {

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    ctx.font = "18px Segoe UI";

    ctx.fillStyle = "#64748B";

    ctx.textAlign = "center";

    ctx.fillText(

        message,

        canvas.width / 2,

        canvas.height / 2

    );

}



/* ==========================================================
   REFRESH ALL CHARTS
========================================================== */

function refreshCharts(dashboard) {

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



/* ==========================================================
   DESTROY ALL CHARTS
========================================================== */

function destroyAllCharts() {

    destroyChart(categoryChart);

    destroyChart(trendChart);

    destroyChart(paymentChart);

    destroyChart(userChart);

}



/* ==========================================================
   WINDOW RESIZE
========================================================== */

window.addEventListener(

    "resize",

    () => {

        if (!dashboardData)

            return;

        refreshCharts(

            dashboardData

        );

    }

);



/* ==========================================================
   CHART LOADING PLACEHOLDER
========================================================== */

function showLoadingCharts() {

    [

        "categoryChart",

        "trendChart",

        "paymentChart",

        "userChart"

    ].forEach(id => {

        const canvas =
            document.getElementById(id);

        if (!canvas)

            return;

        const ctx =
            canvas.getContext("2d");

        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

        ctx.font = "18px Segoe UI";

        ctx.fillStyle = "#94A3B8";

        ctx.textAlign = "center";

        ctx.fillText(

            "Loading...",

            canvas.width / 2,

            canvas.height / 2

        );

    });

}



/* ==========================================================
   INITIALISE
========================================================== */

showLoadingCharts();
