const apiPath = "ag3mjksynlokt4gii70y5kqhmqj1";
const baseUrl = "https://livejs-api.hexschool.io";
const user = "customer"

let productData = [];

// 取得產品列表
function getProduct() {
  const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/products`;
  axios.get(url)
    .then((res) => {
      productData = res.data.products;
      //  console.log(productData)
      init(productData);
      categoryOption();
      getCart();
    })
}

getProduct();

// 產品列表渲染
function init(data) {
  let str = "";
  let list = document.getElementById('list');

  data.forEach((item) => {
    str += `<li>
        <img src="${item.images}"
            alt="${item.title}" class="itemImg" >
        <h3 class="itemName">${item.title}</h3>
            <p class="itemDescription">${item.description}</p>
            <del class="originalPrice">原價:${item.origin_price}</del>
            <h5 class="itemPrice">${item.price}</h5>
                <button class="btn addCartBtn" data-id="${item.id}">點此選購</button>
    </li>`;
  })

  list.innerHTML = str;
}

const selectMenu = document.getElementById('selectMenuId');
// 商品類別渲染
function categoryOption() {
  let categoryOption = {}

  productData.forEach((item) => {
    if (categoryOption[item.category] == undefined) categoryOption[item.category] = 1
    else categoryOption[item.category]++
  })

  let categoryKeys = Object.keys(categoryOption);

  // console.log(keys)
  let str = `<option value="全部" disabled selected hidden>商品類別</option>
<option value="全部">全部</option>`

  categoryKeys.forEach((item) => {
    str += `<option value="${item}">${item}</option>`
  })
  // console.log(str)
  selectMenu.innerHTML = str;
}

// 搜尋
const selectItem = document.getElementById('selectItemId');
const selectItemKeyword = document.getElementById('selectItemKeywordId');
const selectItemBtn = document.getElementById('selectItemBtnId');

selectMenu.addEventListener('change', (e) => {
  let filterData;
  const category = e.target.value;
  const keyword = selectItemKeyword.value;
  if (keyword !== "" && category !== "全部") filterData = productData.filter((item) => item.category == category && item.title.toLowerCase().includes(keyword.toLowerCase()))
  else if (keyword !== "" && category == "全部") filterData = productData.filter((item) => item.title.toLowerCase().includes(keyword.toLowerCase()))
  else filterData = productData.filter((item) => item.category == category || category == "全部")
  // console.log(filterData)
  init(filterData)
}, false)

selectItemBtn.addEventListener('click', (e) => {
  e.preventDefault();
  let filterData;
  const category = selectMenu.value;
  const keyword = selectItemKeyword.value;
  if (category !== "全部") filterData = productData.filter((item) => item.category == category && item.title.toLowerCase().includes(keyword.toLowerCase()))
  else filterData = productData.filter((item) => item.title.toLowerCase().includes(keyword.toLowerCase()))
  init(filterData);
}, false)

// 加入購物車
let addCartBtn = document.querySelectorAll('.addCartBtn');
let cartData = [];
let cartList = document.querySelector('.cartList');
let list = document.getElementById('list');

list.addEventListener('click', (e) => {
  e.preventDefault();

  if (e.target.nodeName !== 'BUTTON') return;

  let id = e.target.dataset.id;
  // console.log(id)
  addCart(id);
}, false)

function addCart(id) {
  let cartItem = {}
  let haveThisItem = false;

  cartData.forEach((item) => {
    if (item.product.id == id) {
      swal("購物車已有這項商品", "可至「我的購物車」修改數量", "info");
      haveThisItem = true;
    }
  })

  if (haveThisItem) return;

  productData.forEach((item) => {
    if (item.id == id) {
      cartItem = {
        data: {
          productId: item.id,
          quantity: 1
        }
      }
    }
  })

  // console.log(cartItem)
  const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/carts`;
  axios.post(url, cartItem)
    .then((res) => {
      swal("商品已加入購物車", "", "success", { button: "繼續逛逛" });
      restartCart(res)
    })
    .catch((error) => {
      console.log(error)
    })
}

function getCart() {
  const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/carts`;
  axios.get(url)
    .then((res) => {
      restartCart(res)
    })
    .catch((error) => {
      console.log(error)
    })
}

// 購物車刪除按鈕
cartList.addEventListener('click', (e) => {
  e.preventDefault();
  // console.log(e.target.nodeName)
  // console.log(e.target.className)
  if (e.target.nodeName !== 'BUTTON') return;
  else if (e.target.className == "cartList-title-btn btn") deleteCartAll();
  else deleteCartOne(e.target.dataset.id)

}, false)

// 清除購物車內全部產品
function deleteCartAll() {
  if (cartData.length == 0) {
    swal("購物車裡目前沒有東西", "先去購物吧", "info", { button: "開始花錢" });
    return;
  }

  const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/carts`;
  axios.delete(url)
    .then((res) => {
      restartCart(res);
      swal("購物車已清空", "", "success", { button: "繼續逛逛" });
    })
    .catch((err) => {
      console.log(err);
    })
}

// 刪除品項
function deleteCartOne(id) {
  let cartId = id
  const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/carts/${cartId}`;
  axios.delete(url)
    .then((res) => {
      swal("商品刪除成功", "", "success", { button: "繼續逛逛" });
      restartCart(res);
    })
    .catch((error) => {
      console.log(error);
    })
}
// 修改數量
cartList.addEventListener('change', (e) => {

  if (e.target.className !== "cartProductQuantity") return;

  let cartItem = {}
  // let filterData;
  // filterData = productData.filter((item) => item.id == id)

  if (e.target.value < 1) {
    swal("商品數量小於 1", "", "warning", { buttons: { 刪除此商品: true, 重新修改數量: true } }).then((value) => {
      switch (value) {
        case "刪除此商品":
          deleteCartOne(e.target.dataset.id);
          break;
        case "重新修改數量":
          e.target.value = 1
          break;
      }
    });
    return;
  }

  cartData.forEach((item) => {
    if (item.id == e.target.dataset.id) {
      cartItem = {
        data: {
          id: item.id,
          quantity: Number(e.target.value)
        }
      }
    }
  })

  //console.log(cartItem)
  const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/carts`;
  axios.patch(url, cartItem)
    .then((res) => {
      restartCart(res)
      swal("商品數量已修正", "金額有變動，請確認是否有在預算內", "success");
    })
    .catch((err) => {
      console.log(err)
    })

}, false)


// 渲染購物車列表
function restartCart(res) {
  cartData = [];
  // console.log(res)
  cartData = res.data.carts;
  cardListInit(cartData)
}

function cardListInit(cartData) {
  // console.log(cartData[0])
  let str = `<thead><tr class="cartList-title">
  <th>品項</th>
  <th>單價</th>
  <th>數量</th>
  <th>金額</th>
  <th><button class="cartList-title-btn btn">清空購物車</button></th>
</tr></thead><tbody>`;
  let price = 0;

  if (cartData.length > 0) {
    cartData.forEach((item, arry) => {
      str += `<tr><td>
      <div class="d-flex align-item-center">
      <img src="${item.product.images}" class="cart-img  d-inline-block"> 
      ${item.product.title}
      </div>
      </td>
      <td>NT$${item.product.price}</td>
      <td><input type="number" min = "0" value="${item.quantity}" class="cartProductQuantity"  data-id="${item.id}"> </td>
      <td>NT$${item.product.price * item.quantity}</td>
      <td><button class="btn cartList-btn" data-id="${item.id}">刪除品項</button></td>
      </tr>`;
      price += item.quantity * item.product.price
    })
  }

  let toatlPriceStr = `</tbody>
  <tfoot><tr><th  colspan="4" class="totalPrice">總金額：</th>
  <td class="totalPriceInCartList">NT$${price}</td></tr></tfoot>`

  cartList.innerHTML = str + toatlPriceStr
}


//表單驗證
let customerForm = document.getElementById("customerForm");
let input = document.querySelectorAll("#customerForm input, #customerForm select");

let constraints = {
  "姓名": {
    presence: {
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
  "電話": {
    presence: {
      allowEmpty: false,
      message: "為必填欄位"
    },
    length: {
      minimum: 8,
      message: "至少需要 8 碼"
    }
  },
  "Email": {
    presence: {
      allowEmpty: false,
      message: "為必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
  "交易方式": {
    presence: {
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
}

customerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log(cartData)
  if (cartData.length == 0) {
    swal("購物車裡沒有東西", "優質傢具不順手帶回家嗎", "error", { button: "開始花錢" });
    return;
  } else handleFormSubmit(customerForm);
})

function handleFormSubmit(form) {
  let errors = validate(form, constraints);
  if (errors) {
    swal("資料未填寫完整", "", "error", { button: "繼續填寫" });
    Object.keys(errors).forEach((keys) => document.querySelector(`.${keys}`).textContent = errors[keys]);
  }
  else {
    sendOrderSuccess();
    return
  }

  input.forEach((item) => {
    item.addEventListener("change", (e) => {
      let message = document.querySelector(`.message.${item.name}`);
      message.textContent = "";
      let errors = validate(form, constraints);
      if (errors) {
        Object.keys(errors).forEach((keys) => document.querySelector(`.${keys}`).textContent = errors[keys]);
      }
    })
  })
}

// 成功送出表單
function sendOrderSuccess() {
  let name = document.getElementById('name').value;
  let tel = document.getElementById('tel').value;
  let email = document.getElementById('email').value;
  let address = document.getElementById('address').value;
  let payment = document.getElementById('payment').value;

  const customerData = {
    data: {
      user: {
        name, tel, email, address, payment
      }
    }
  }

  const url = `${baseUrl}/api/livejs/v1/${user}/${apiPath}/orders`;
  axios.post(url, customerData)
    .then((res) => {
      // console.log(res)
    })

  swal("訂單已送出", "感謝訂購！我們會盡快將商品送出", "success");
  customerForm.reset();
  deleteCartAll();
}

const upIcon = document.querySelector('.upIcon')

upIcon.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
})
