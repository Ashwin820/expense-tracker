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
