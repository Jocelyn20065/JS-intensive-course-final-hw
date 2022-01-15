// console.log('hello')
// console.log(api_path,token)

//初始化資料: 產品列表+購物車資訊
function init(){
  getProductList();
  getCartList()
}
init();

// 取得購物車資訊
let productData=[];
const productList=document.querySelector('.productWrap');
const cartList=document.querySelector('.shoppinCart-tableList');

function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
      then(function (response) {
        productData=response.data.products;
        renderProductList();
      })
      .catch(function(error){
        console.log(error.response.data)
      })
  }


// 組字串函式
function combineProductHTMLItem(item){
  return `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img  src="${item.images}" alt="">
  <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${item.origin_price}</del>
  <p class="nowPrice">NT$${item.price}</p>
  </li>`
}
function renderProductList(){
  let str="";
  productData.forEach(function(item){
      item.origin_price=toCurrency(item.origin_price);
      item.price=toCurrency(item.price);
      str+=combineProductHTMLItem(item);   
  })
  productList.innerHTML=str;
}

// 篩選器邏輯

const productSelect=document.querySelector('.productSelect');
productSelect.addEventListener('change',function(e){
  const category=e.target.value;
  if(category==="全部"){
    renderProductList();
    return;
  }
  let str="";
  productData.forEach(function(item){
    // console.log(item.category)
    if(item.category===category){
      str+=combineProductHTMLItem(item);
    }
  })
  productList.innerHTML=str;
})

// 取得購物車資訊
let cartData=[];
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      // console.log(response.data);
      const totalPrice=document.querySelector('.js-totalPrice');
      totalPrice.textContent=toCurrency(response.data.finalTotal);
      cartData=response.data.carts;
      let str="";
      cartData.forEach(function(item){
        str+=` <tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${toCurrency(item.product.price)}</td>
        <td>${item.quantity}</td>
        <td>NT$${toCurrency(item.quantity*item.product.price)}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id=${item.id}>
                clear
            </a>
        </td>
    </tr>`;
      })
      cartList.innerHTML=str;
    })
}

// 加入購物車按鈕綁監聽
productList.addEventListener('click',function(e){
  e.preventDefault();
  let addCartClass=e.target.getAttribute('class');
  if(addCartClass !=="addCardBtn"){
    return;
  }
  let productId=e.target.getAttribute('data-id');
  console.log(productId);
  let checkNum=1;
  cartData.forEach(function(item){
    if(item.product.id===productId){
      checkNum=item.quantity+=1;
    }
  })
  console.log(checkNum)
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    data:{
      "productId":productId,
      "quantity":checkNum,
    }
  }).
  then(function(response){
    alert('加入成功')
    getCartList();
  })
  
})

// 刪除邏輯
cartList.addEventListener('click',function(e){
  e.preventDefault();
  const cartId=e.target.getAttribute('data-id');
  if(cartId===null){
    console.log('wrong place')
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).then(function(response){
    alert('刪除成功');
    getCartList();
  })

})

// 刪除全部邏輯
const discardAllBtn=document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).then(function(response){
    alert('購物車已清空')
    getCartList();
  }).catch(function(resposnse){
    alert('購物車空空的')
  })
})

//送出訂單
const orderInfoBtn=document.querySelector('.orderInfo-btn');
const orderInfoForm=document.querySelector('.orderInfo-form');
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const customerName=document.querySelector('#customerName').value;
const customerPhone=document.querySelector('#customerPhone').value;
const customerEmail=document.querySelector('#customerEmail').value;
const customerAddress=document.querySelector('#customerAddress').value;
const tradeWay=document.querySelector('#tradeWay').value;

orderInfoBtn.addEventListener('click',function(e){
  e.preventDefault();
  // console.log('點擊到了');
  if(cartData.length===0){
    alert('購物車內沒有東西')
    return;
  }
  //如果有空白就無法送出
  if (customerName==="" || customerPhone==="" || customerEmail==="" || customerAddress==="" || tradeWay===""){
    alert('訂單資訊有缺少')
    return
  }
  console.log('ok')
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
      }
    }
  }
  )
    .then(function (response) {
      alert('訂單已送出')
     getCartList();
     orderInfoForm.reset();
    })

})

//validate
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    format: {
      pattern:'^09\\d{8}$',
      message: "請輸入正確電話格式"
    }
  },
  "信箱": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    },
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};
inputs.forEach(function(item){
  item.addEventListener('input',function(){
    item.nextElementSibling.textContent = '';
    let error=validate(orderInfoForm,constraints) || "";
    if(error){
      Object.keys(error).forEach(function(key){
        // console.log(key)
        // console.log(document.querySelector(`[data-message=${key}]`))
        document.querySelector(`[data-message=${key}]`).textContent=error[key];
      })
    }
  })
})



  // 小工具: 價格數字添加分號
function toCurrency(num){
    let parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
} //參考網址:https://dotblogs.com.tw/AlenWu_coding_blog/2017/08/11/js_number_to_currency_comma



