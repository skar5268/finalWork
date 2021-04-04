const uid = {
    headers: {
        'Authorization': " Ag3MjkSyNLOkt4giI70Y5KQhmQj1"
    }
}

let ordersData = []
const orderList = document.querySelector('.orderList');
const delAllOrderBtn = document.querySelector('.delAllOrderBtn');
const selectChart = document.getElementById('selectChart');

function getOrdersData() {
    axios.get('https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/ag3mjksynlokt4gii70y5kqhmqj1/orders', uid)
        .then((res) => {
            ordersData = res.data.orders;
            ordersData.sort((a, b) => {
                let timeA = a.createdAt;
                let timeB = b.createdAt;
                return timeA - timeB;
            })
            init(ordersData);
            revenueChart(ordersData)
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
        console.log(timeStamp)
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
    axios.delete('https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/ag3mjksynlokt4gii70y5kqhmqj1/orders', uid)
        .then((res) => {
            restart(res)
        })
}, false)

// 刪除訂單 or 變更狀態
orderList.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(e.target.className)
    if (e.target.className == "delOrderBtn") delOrederOne(e);
    else if (e.target.className == "changeOrderStatusBtn") changeOrderStatus(e);
    else return;
}, false)

// 刪除一筆訂單
function delOrederOne(e) {
    const delOrderBtn = document.querySelectorAll('.delOrderBtn')
    // console.log(delOrderBtn)
    const orderId = e.target.dataset.id;
    // console.log(orderId)

    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/ag3mjksynlokt4gii70y5kqhmqj1/orders/${orderId}`, uid)
        .then((res) => {
            restart(res)
        })
}

// 變更狀態
function changeOrderStatus(e) {
    //  const delOrderBtn = document.querySelectorAll('.delOrderBtn')
    // console.log(delOrderBtn)
    let obj = {}
    const orderId = e.target.dataset.id;
    console.log(orderId)

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

    axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/ag3mjksynlokt4gii70y5kqhmqj1/orders`, obj, uid)
        .then((res) => {
            restart(res);
        })
}

// 重新渲染列表
function restart(res) {
    // let newOrdersData = [];
    // newOrdersData = res.data.orders;
    // init(newOrdersData)
    // console.log(res)
    ordersData = [];
    ordersData = res.data.orders;
    init(ordersData);
    chart(ordersData);
}


// 圓餅圖
selectChart.addEventListener('change', (e) => {
    if (e.target.value == "全產品類別營收比重") categoryChart(ordersData)
    else if (e.target.value == "前 3 名品項營收比重") revenueRankChart(ordersData)
    else revenueChart(ordersData)
}, false)

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

    console.log(editData)
    let columns = []
    let editDataKey = Object.keys(editData);

    editDataKey.forEach((item, index) => {
        columns.push([[item], editData[item]])
    })

    console.log(columns)

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
            if (item == editData[editItem]) newColumns.push([editItem, editData[editItem]])
        })
    })

    // 未達前三名的各項商品營收
    let elseRevenue = 0
    for (let i = 3; i < columns.length; i++) {
        elseRevenue += columns[i]
    }

    // 將要呈現的資料存成新陣列
    let chartColumn = []
    chartColumn.push(newColumns[0], newColumns[1], newColumns[2], ['其他商品', elseRevenue])

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


const  upIcon = document.querySelector('.upIcon')

upIcon.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
});
})