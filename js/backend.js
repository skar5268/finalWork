const uid = {
    headers: {
        'Authorization': "Ag3MjkSyNLOkt4giI70Y5KQhmQj1"
    }
}
const apiPath = "ag3mjksynlokt4gii70y5kqhmqj1";
const baseUrl = "https://livejs-api.hexschool.io";
const user = "admin";

let ordersData = []
const orderList = document.querySelector('.orderList');
const delAllOrderBtn = document.querySelector('.delAllOrderBtn');
const selectChart = document.getElementById('selectChart');

function getOrdersData() {
    const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/orders`;
    axios.get(url, uid)
        .then((res) => {
            ordersData = res.data.orders;
            ordersData.sort((a, b) => {
                let timeA = a.createdAt;
                let timeB = b.createdAt;
                return timeA - timeB;
            })
            init(ordersData);
            revenueChart(ordersData);
            // categoryChart(ordersData)
            // revenueRankChart(ordersData)
            // chart(ordersData);
        })
}

getOrdersData();

// 渲染訂單
function init(ordersData) {
    let str = `<tr class="listContent">
    <th>訂單編號</th>
    <th>聯絡人</th>
    <th>聯絡地址</th>
    <th>電子郵件</th>
    <th>訂單品項</th>
    <th>訂單日期</th>
    <th>訂單狀態</th>
    <th>操作</th>
</tr>`;
    // console.log(orderList)

    ordersData.forEach((item) => {
        let paid;
        let paidColor;

        // 訂單狀態
        if (item.paid) {
            paid = "已處理";
            paidColor = "rgba(182,214,223,0.3)";
        } else {
            paid = "未處理";
            paidColor = "rgba(211,172,64,0.3)";
        }

        // 訂單品項
        let productsList = ""
        item.products.forEach((item) => { productsList += `${item.title} </br>` })

        // 訂單日期
        let timeStamp = item.createdAt
        // console.log(timeStamp)
        let date = new Date(timeStamp * 1000)

        let dateValues = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
        ];

        let dateInput = `${dateValues[0]}/${dateValues[1]}/${dateValues[2]}`

        str += `            <tr class="listContent">
        <td class="text-align-center">${item.id}</td>
        <td class="text-align-center">${item.user.name}</td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>${productsList}</td>
        <td class="text-align-center">${dateInput}</td>
        <td class="text-align-center orderStatusText" style="background-color:${paidColor}">${paid}</td>
        <td><a href="#" class="changeOrderStatusBtn"  data-id="${item.id}">狀態變更</a><a href="#" class="delOrderBtn"  data-id="${item.id}">刪除</a></td>
    </tr>`
    })

    orderList.innerHTML = str
}

// 刪除全部訂單
delAllOrderBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (ordersData.length == 0){
            swal("目前沒有訂單", "", "info");
            return;
    }
    const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/orders`
    axios.delete(url, uid)
        .then((res) => {
            swal("訂單已全部刪除", "", "success");
            restart(res);
        })
}, false)

// 刪除訂單 or 變更狀態
orderList.addEventListener('click', (e) => {
    e.preventDefault();
    // console.log(e.target.className)
    if (e.target.className == "delOrderBtn") delOrederOne(e.target.dataset.id);
    else if (e.target.className == "changeOrderStatusBtn") changeOrderStatus(e.target.dataset.id);
    else return;
}, false)

// 刪除一筆訂單
function delOrederOne(id) {
    const delOrderBtn = document.querySelectorAll('.delOrderBtn')
    // console.log(delOrderBtn)
    const orderId = id;
    // console.log(orderId)
    const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/orders/${orderId}`
    axios.delete(url, uid)
        .then((res) => {
            swal("訂單刪除成功", "", "success");
            restart(res);
        })
}

// 變更狀態
function changeOrderStatus(id) {
    //  const delOrderBtn = document.querySelectorAll('.delOrderBtn')
    // console.log(delOrderBtn)
    let obj = {}
    const orderId = id;
    // console.log(orderId)

    let paid;
    ordersData.forEach((item) => {
        if (item.id == orderId) paid = !(item.paid);
    })

    obj = {
        data: {
            id: orderId,
            paid: paid
        }
    }

    const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/orders`
    axios.put(url, obj, uid)
        .then((res) => {
            swal("訂單狀態變更成功", "", "success");
            restart(res);
        })
}

// 重新渲染列表
function restart(res) {
    ordersData = [];
    ordersData = res.data.orders;
    ordersData.sort((a, b) => {
        let timeA = a.createdAt;
        let timeB = b.createdAt;
        return timeA - timeB;
    })
    init(ordersData);
    chartTitle(selectChart.value)
}

// 圓餅圖
selectChart.addEventListener('change', (e) => {
    chartTitle(e.target.value)
}, false)

// 圓餅圖 Title
function chartTitle(nowValue) {
    if (ordersData.length < 1) {
        let categoryChart = c3.generate({
            bindto: "#chart",
            data: {
                columns: [],
                type: 'pie',
            },
        })
        return;
    }

    if (nowValue == "全產品類別營收比重") categoryChart(ordersData)
    else if (nowValue == "前 3 名品項營收比重") revenueRankChart(ordersData)
    else revenueChart(ordersData)
}

// 全品項營收比重
function revenueChart(data) {
    let editData = {};

    data.forEach((item) => {
        item.products.forEach((item) => {
            if (editData[item.title] == undefined) {
                editData[item.title] = item.price * item.quantity;
            } else {
                editData[item.title] += item.price * item.quantity;
            }
        })
    });

    // console.log(editData)
    let columns = []
    let editDataKey = Object.keys(editData);

    editDataKey.forEach((item, index) => {
        columns.push([[item], editData[item]])
    })

    // console.log(columns)

    let revenueChart = c3.generate({
        bindto: "#chart",
        data: {
            columns: columns,
            type: 'pie',
        },
        color: {
            pattern: ['#3c556a', '#4e6e88', '#b6d6df', '#287094', '#33546d', '#388ac4', '#3351a6', '#4f8fc0']
        }
    })
}

// 全產品類別營收比重
function categoryChart(data) {
    let editData = {};

    data.forEach((item) => {
        item.products.forEach((item) => {
            if (editData[item.category] == undefined) {
                editData[item.category] = 1;
            } else {
                editData[item.category] += 1;
            }
        })
    });

    // console.log(editData)
    let columns = []
    let editDataKey = Object.keys(editData);

    editDataKey.forEach((item, index) => {
        columns.push([[item], editData[item]])
    })

    // console.log(columns)

    let categoryChart = c3.generate({
        bindto: "#chart",
        data: {
            columns: columns,
            type: 'pie',
        },
        color: {
            pattern: ['#3c556a', '#4e6e88', '#b6d6df']
        }
    })
}

// 前 3 名品項營收比重
function revenueRankChart(data) {
    let editData = {};

    data.forEach((item) => {
        item.products.forEach((item) => {
            if (editData[item.title] == undefined) {
                editData[item.title] = item.price * item.quantity;
            } else {
                editData[item.title] += item.price * item.quantity;
            }
        })
    });

    let columns = []
    let editDataKey = Object.keys(editData);

    // 取各項商品的價錢放至新陣列
    editDataKey.forEach((item, index) => {
        columns.push(editData[item])
    })

    // 將價錢由高至低排序
    columns.sort((a, b) => {
        return a - b
    }).reverse()

    // 將各價錢與商品存成一組陣列
    let newColumns = []
    columns.forEach((item) => {
        editDataKey.forEach((editItem) => {
            if (item == editData[editItem]) newColumns.push([editItem, editData[editItem]]);
        })
    })

    // 未達前三名的各項商品營收
    let elseRevenue = 0;

    // 將要呈現的資料存成新陣列
    let chartColumn = [];
    if (columns.length < 3) {
        newColumns.forEach((item) => {
            chartColumn.push(item);
        })
    } else {
        for (let i = 3; i < columns.length; i++) {
            elseRevenue += columns[i];
        }
        chartColumn.push(newColumns[0], newColumns[1], newColumns[2], ['其他商品', elseRevenue]);
    }


    let revenueRankChart = c3.generate({
        bindto: "#chart",
        data: {
            columns: chartColumn,
            type: 'pie',
        },
        color: {
            pattern: ['#3c556a', '#4e6e88', '#287094', '#b6d6df']
        }
    })
}


const upIcon = document.querySelector('.upIcon')

upIcon.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
})
