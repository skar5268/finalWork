let productData = [];

// 取得產品列表
axios.get('https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/ag3mjksynlokt4gii70y5kqhmqj1/products')
    .then((res => {
        productData = res.data.products;
        console.log(productData)
        init(productData)
    }))

// 渲染
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


// 搜尋
let selectItem = document.getElementById('selectItemId');
let selectItemKeyword = document.getElementById('selectItemKeywordId');
let selectItemBtn = document.getElementById('selectItemBtnId');

selectItemBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let filterData;
    let keyword = selectItemKeyword.value;
    filterData = productData.filter((item) => item.title.includes(keyword))
    init(filterData);
}, false)

// 加入購物車
let addCartBtn = document.querySelectorAll('.addCartBtn');
let cartData = [];
addCart();
function addCart() {
    let list = document.getElementById('list');

    list.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.nodeName !== 'BUTTON') return;

        let id = e.target.dataset.id;
        let filterData;
        filterData = productData.filter((item) => item.id == id)

        cartItem = {
            data: {
                productId: filterData[0].id,
                quantity: 5
            }
        }

        axios.post('https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/ag3mjksynlokt4gii70y5kqhmqj1/carts', cartItem)
            .then((response) => {
                let cartList = document.querySelector('.cartList');
                let str = `            <tr>
                <th>品項</th>
                <th>數量</th>
                <th>金額</th>
                <th><button class="btn">清空 <br> 購物車</button></th>
            </tr>`;
                cartData.push(response.data.carts);
                // console.log(response)
                // console.log(cartData)
                cartData[0].forEach((item) => {
                    str += `<tr><td>${item.product.title}</td>
                    <td>${item.quantity}</td>
                    <td>${item.product.price}</td>
                    <td><button class="btn">刪除品項</button></td>
                    </tr>`
                })

                cartList.innerHTML = str
                //console.log(response)
            })
            .catch((error) => {
                console.log(error)
            })

    }, false)
}



//表單驗證
let customerForm = document.getElementById("customerForm");
let input = document.querySelectorAll("#customerForm input, #addTicketId select");

let constraints = {
  "姓名":{
    presence:{
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
  "電話":{
    presence:{
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
  "Email":{
    presence:{
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
  "寄送地址":{
    presence:{
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
    "交易方式":{
    presence:{
      allowEmpty: false,
      message: "為必填欄位"
    },
  },
}

customerForm.addEventListener("submit",function(e){
  e.preventDefault();
  if(cartData == []){
      alert('購物車裡沒有東西');
      return;
  }else handleFormSubmit(customerForm);
})

function handleFormSubmit(form){
  let errors = validate(form,constraints);
  if (errors){
    Object.keys(errors).forEach((keys) => document.querySelector(`.${keys}`).textContent = errors[keys]);
  }
//   else {
//     //console.log("success")
//     addTicketSuccess();
//   }
  
  input.forEach((item) => {
    item.addEventListener("change", (e) => {
      let message = document.querySelector(`.messages.${item.name}`);
      message.textContent= "";
      let errors = validate(form,constraints);
      if (errors){
        Object.keys(errors).forEach((keys) => document.querySelector(`.${keys}`).textContent = errors[keys]);
      }
    })
  })
}