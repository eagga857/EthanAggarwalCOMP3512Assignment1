
var map;
var mapInfo = [0, 0];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: mapInfo[0], lng: mapInfo[1] },
        zoom: 16
    });
}

//Add charts
//Add to domain

document.addEventListener("DOMContentLoaded", function () {

    const companyAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php";
    const stockAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol="
    let companies = retrieveStorage();

    function retrieveStorage() {
        return JSON.parse(localStorage.getItem('companies')) || [];
    }

    //Company Info
    let logo = document.querySelector("#logo");
    let infoSymbol = document.querySelector("#infoSymbol");
    let infoName = document.querySelector("#infoName");
    let sector = document.querySelector("#infoSector");
    let subindustry = document.querySelector("#subindustry");
    let address = document.querySelector("#address");
    let website = document.querySelector("#website");
    let exchange = document.querySelector("#exchange")
    let infoDescription = document.querySelector("#infoDescription");
    let textInfo = document.querySelector(".textInfo");

    logo.style.display = "none";
    infoSymbol.style.display = "none";
    infoName.style.display = "none";
    sector.style.display = "none";
    subindustry.style.display = "none";
    address.style.display = "none";
    website.style.display = "none";
    exchange.style.display = "none";
    infoDescription.style.display = "none";
    textInfo.style.display = "none";

    //List of Companies
    let listOfCompanies = document.querySelector("#listOfCompanies");
    let filter = document.querySelector("#companySearch");
    let loader1 = document.querySelector("#loader1");

    listOfCompanies.style.display = "none";
    loader1.style.display = "";

    //Chart View
    let chartDiv = document.querySelector(".charts");
    let cns = document.querySelector(".cns");
    let financialsDiv = document.querySelector(".financials");

    chartDiv.style.display = "none";
    cns.style.display = "none";
    financialsDiv.style.display = "none";

    let years = document.querySelector("#years");
    let revenue = document.querySelector("#revenue");
    let earnings = document.querySelector("#earnings");
    let assets = document.querySelector("#assets");
    let liabilities = document.querySelector("#liabilities");

    //Default View Divs
    let companyListDiv = document.querySelector(".companyList");
    let companyInfoDiv = document.querySelector(".companyInfo");
    let mapDiv = document.querySelector("#map");
    let stockDataDiv = document.querySelector(".stockData");
    let ammDiv = document.querySelector(".amm");

    mapDiv.textContent = "";

    //if no local storage, fetch and update local storage. else run the code with local storage data

    if (companies.length < 1) {

        fetch(companyAPI)
            .then(response => response.json())
            .then(data => {

                localStorage.setItem('companies', JSON.stringify(data));

            });

        companies = retrieveStorage();

    } else {
        filter.addEventListener("keyup", populateList);
        populateList();

        //Clears Filter Then Resets List
        let clearBtn = document.querySelector("#clear");
        clearBtn.addEventListener("click", () => {
            filter.value = "";
            populateList();
        });

        //Adds Companies To List
        function populateList() {

            listOfCompanies.textContent = "";
            companies.forEach(company => {
                //Adds To List If Company Matches Filter
                if (company.symbol.toUpperCase().includes(filter.value.toUpperCase()) || filter.value.length == 0) {

                    let listItem = document.createElement("li");
                    listItem.textContent = company.name;
                    listItem.addEventListener("click", displayData);
                    listItem.style.cursor = "pointer";
                    listOfCompanies.appendChild(listItem);

                }
            });
            loader1.style.display = "none";
            listOfCompanies.style.display = "";
        }

        //Reads out description
        document.querySelector('#speak').addEventListener('click', (e) => {
            const utterance = new SpeechSynthesisUtterance
                (document.querySelector("#description").textContent);
            speechSynthesis.speak(utterance);
        });

        //Display Selected Company Data
        function displayData(e) {

            logo.style.display = "";
            infoSymbol.style.display = "";
            infoName.style.display = "";
            sector.style.display = "";
            subindustry.style.display = "";
            address.style.display = "";
            website.style.display = "";
            exchange.style.display = "";
            infoDescription.style.display = "";
            textInfo.style.display = "";

            var selectedCompany = companies.find(company => e.target.textContent == company.name);

            logo.setAttribute("src", "../logos/" + selectedCompany.symbol + ".svg");
            infoSymbol.textContent = "Symbol: " + selectedCompany.symbol;
            infoName.textContent = "Name: " + selectedCompany.name;
            sector.textContent = "Sector: " + selectedCompany.sector;
            subindustry.textContent = "Subindustry: " + selectedCompany.subindustry;
            address.textContent = "Address: " + selectedCompany.address;
            website.setAttribute("href", selectedCompany.website)
            website.textContent = selectedCompany.website;
            exchange.textContent = "Exchange: " + selectedCompany.exchange;
            infoDescription.textContent = "Description: " + selectedCompany.description;

            mapInfo = [selectedCompany.latitude, selectedCompany.longitude];
            initMap();

            let dateValues = [];
            let openValues = [];
            let closeValues = [];
            let lowValues = [];
            let highValues = [];
            let volumeValues = [];

            let values = [];
            let groupedValues = [];

            fetch(stockAPI + selectedCompany.symbol)
                .then(response => response.json())
                .then(data => {
                    groupedValues.push(...data);
                    appendTables();
                });

            function appendTables() {

                dateValues = [];
                openValues = [];
                closeValues = [];
                lowValues = [];
                highValues = [];
                volumeValues = [];

                groupedValues.forEach(day => {
                    dateValues.push(day.date);
                    openValues.push(parseInt(day.open));
                    closeValues.push(parseInt(day.close));
                    lowValues.push(parseInt(day.low));
                    highValues.push(parseInt(day.high));
                    volumeValues.push(parseInt(day.volume));
                });

                values = [dateValues, openValues, closeValues, lowValues, highValues, volumeValues];
                makeUpperTable();
                makeLowerTable();
            }

            function makeUpperTable() {

                while (document.querySelector("#dataTable").childNodes.length > 2) {
                    document.querySelector("#dataTable").removeChild(document.querySelector("#dataTable").lastChild);
                }

                for (let i = 0; i < openValues.length; i++) {
                    let row = document.createElement("tr");

                    for (let j = 0; j < values.length; j++) {
                        let tableInfo = document.createElement("td");
                        tableInfo.textContent = values[j][i];
                        row.appendChild(tableInfo);
                    }

                    document.querySelector("#dataTable").appendChild(row);
                }
            }

            function makeLowerTable() {

                let average = document.querySelector("#average");
                let min = document.querySelector("#min");
                let max = document.querySelector("#max");

                average.innerHTML = "<td>Average: </td>";
                min.innerHTML = "<td>Min: </td>";
                max.innerHTML = "<td>Max: </td>";

                var averages = [openValues.reduce((a, b) => a + b) / companies.length, closeValues.reduce((a, b) => a + b) / companies.length, lowValues.reduce((a, b) => a + b) / companies.length, highValues.reduce((a, b) => a + b) / companies.length, volumeValues.reduce((a, b) => a + b) / companies.length];
                var mins = [Math.min(...openValues), Math.min(...closeValues), Math.min(...lowValues), Math.min(...highValues), Math.min(...volumeValues)];
                var maxs = [Math.max(...openValues), Math.max(...closeValues), Math.max(...lowValues), Math.max(...highValues), Math.max(...volumeValues)];

                for (let i = 0; i < 5; i++) {
                    let averageTD = document.createElement("td");
                    averageTD.textContent = averages[i].toFixed(2);
                    average.appendChild(averageTD);
                    chartAverages.push(averages[i]);

                    let minTD = document.createElement("td");
                    minTD.textContent = mins[i].toFixed(2);
                    min.appendChild(minTD);
                    chartMins.push(mins[i]);

                    let maxTD = document.createElement("td");
                    maxTD.textContent = maxs[i].toFixed(2);
                    max.appendChild(maxTD);
                    chartMaxs.push(maxs[i]);
                }
            }

            document.querySelector("#date").addEventListener("click", function () {
                groupedValues = groupedValues.sort((a, b) => new Date(a.date) - new Date(b.date));

                appendTables();
            });
            document.querySelector("#open").addEventListener("click", function () {
                groupedValues = groupedValues.sort((a, b) => a.open - b.open);

                appendTables();
            });
            document.querySelector("#close").addEventListener("click", function () {
                groupedValues = groupedValues.sort((a, b) => a.close - b.close);

                appendTables();
            });
            document.querySelector("#low").addEventListener("click", function () {
                groupedValues = groupedValues.sort((a, b) => a.low - b.low);

                appendTables();
            });
            document.querySelector("#high").addEventListener("click", function () {
                groupedValues = groupedValues.sort((a, b) => a.high - b.high);

                appendTables();
            });
            document.querySelector("#volume").addEventListener("click", function () {
                groupedValues = groupedValues.sort((a, b) => a.volume - b.volume);

                appendTables();
            });

            //Chart View
            document.querySelector("#nameAndSymbol").textContent = selectedCompany.name + " - " + selectedCompany.symbol;
            document.querySelector("#description").textContent = selectedCompany.description;

            years.textContent = "";
            revenue.textContent = "";
            earnings.textContent = "";
            assets.textContent = "";
            liabilities.textContent = "";

            let chartRevenues = [];
            let chartEarnings = [];
            let chartAssets = [];
            let chartLiabilities = [];

            let chartAverages = [];
            let chartMins = [];
            let chartMaxs = [];

            if (selectedCompany.financials != null) {

                selectedCompany.financials.years.forEach(year => {
                    let listItem = document.createElement("li");
                    listItem.textContent = year;
                    years.appendChild(listItem);
                })
                selectedCompany.financials.revenue.forEach(year => {
                    let listItem = document.createElement("li");
                    listItem.textContent = "$" + year.toLocaleString();
                    revenue.appendChild(listItem);
                    chartRevenues.push(year);
                });
                selectedCompany.financials.earnings.forEach(year => {
                    let listItem = document.createElement("li");
                    listItem.textContent = "$" + year.toLocaleString();
                    earnings.appendChild(listItem);
                    chartEarnings.push(year);
                });
                selectedCompany.financials.assets.forEach(year => {
                    let listItem = document.createElement("li");
                    listItem.textContent = "$" + year.toLocaleString();
                    assets.appendChild(listItem);
                    chartAssets.push(year);
                });
                selectedCompany.financials.liabilities.forEach(year => {
                    let listItem = document.createElement("li");
                    listItem.textContent = "$" + year.toLocaleString();
                    liabilities.appendChild(listItem);
                    chartLiabilities.push(year);
                });

                createBarChart();
                createCandleChart();
                createLineChart();
                document.querySelector("#barChart").style.display = "";
                document.querySelector("#candleChart").style.display = "";
                document.querySelector("#lineChart").style.display = "";
            } else {
                document.querySelector("#barChart").style.display = "none";
                document.querySelector("#candleChart").style.display = "none";
                document.querySelector("#lineChart").style.display = "none";
            }

            function createBarChart() {
                let chartDom = document.getElementById('barChart');
                let myChart = echarts.init(chartDom);
                let option;

                option = {
                    legend: {},
                    tooltip: {},
                    dataset: {
                        source: [
                            ['Year', '2017', '2018', '2019'],
                            ['Revenue', chartRevenues[0], chartRevenues[1], chartRevenues[2]],
                            ['Earnings', chartEarnings[0], chartEarnings[1], chartEarnings[2]],
                            ['Assets', chartAssets[0], chartAssets[1], chartAssets[2]],
                            ['Liabilities', chartLiabilities[0], chartLiabilities[1], chartLiabilities[2]]
                        ]
                    },
                    xAxis: { type: 'category' },
                    yAxis: {},
                    series: [
                        { type: 'bar' },
                        { type: 'bar' },
                        { type: 'bar' }
                    ]
                };

                option && myChart.setOption(option);
            }


            function createCandleChart() {
                console.log(chartAverages);
                console.log(chartMins);
                console.log(chartMaxs);
                let chartDom = document.getElementById('candleChart');
                let myChart = echarts.init(chartDom);
                let option;
                option = {
                    xAxis: {
                        data: ['Average', 'Min', 'Max']
                    },
                    yAxis: {},
                    series: [{
                        type: 'k',
                        data: [
                            [chartAverages[0], chartAverages[1], chartAverages[2], chartAverages[3]],
                            [chartMins[0], chartMins[1], chartMins[2], chartMins[3]],
                            [chartMaxs[0], chartMaxs[1], chartMaxs[2], chartMaxs[3]]
                        ]
                    }]
                };

                option && myChart.setOption(option);
            }

            function createLineChart() {
                
                let chartDom = document.getElementById('lineChart');
                let myChart = echarts.init(chartDom);
                let option;
                
                option = {
                    xAxis: {
                        type: 'category',
                        data: dateValues.values()
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: volumeValues.values(),
                        type: 'line',
                        smooth: true
                    }]
                };
               
                option && myChart.setOption(option);
            }

        }

        //Open Chart View
        document.querySelector("#openCharts").addEventListener("click", openCharts);

        function openCharts() {

            companyListDiv.style.display = "none";
            companyInfoDiv.style.display = "none";
            mapDiv.style.display = "none";
            stockDataDiv.style.display = "none";
            ammDiv.style.display = "none";

            chartDiv.style.display = "";
            cns.style.display = "";
            financialsDiv.style.display = "";

        }

        //Close Chart View
        document.querySelector("#closeBtn").addEventListener("click", openDefault);

        function openDefault() {

            companyListDiv.style.display = "";
            companyInfoDiv.style.display = "";
            mapDiv.style.display = "";
            stockDataDiv.style.display = "";
            ammDiv.style.display = "";

            chartDiv.style.display = "none";
            cns.style.display = "none";
            financialsDiv.style.display = "none";

        }

    }

});