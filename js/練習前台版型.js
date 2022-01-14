// 取得產品資訊

let productData=[];
const productList=document.querySelector(".productWrap");
function getProductList(){
    axios.get("https://livejs-api.hexschool.io/api/livejs/v1/customer/jocelyn3/products").then(function(response){
        productData=response.data.products;
        renderProductList();
    })
}

function renderProductList(){
    let str="";
    productData.forEach(function(item){
        item.origin_price=toCurrency(item.origin_price);
        item.price=toCurrency(item.price);
        str+=`<li class="productCard">
        <h4 class="productType">新品</h4>
        <img  src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
        </li>`})
        productList.innerHTML=str;
}

  // 小工具: 價格數字添加分號
  function toCurrency(num){
    let parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
} //參考網址:https://dotblogs.com.tw/AlenWu_coding_blog/2017/08/11/js_number_to_currency_comma


// 篩選器邏輯

const productSelect=document.querySelector('.productSelect');
productSelect.addEventListener('change',function(e){
    const category=e.target.value;
    if(category==="全部"){
        renderProductList();
        return
    }
    let str="";
    productData.forEach(function(item){
        if(item.category===category){
            str+=`<li class="productCard">
            <h4 class="productType">新品</h4>
            <img  src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
            </li>`
        }
    })
    productList.innerHTML=str;
})

//取得購物車資訊
let cartData=[];
function getCartList(){
    axios.get("https://livejs-api.hexschool.io/api/livejs/v1/customer/jocelyn3/carts").then(function(response){
        const totalPrice=document.querySelector('.js-totalPrice');
        totalPrice.textContent=toCurrency(response.data.finalTatol);
        cartData=response.data.carts;
        let str="";
        cartData.forEach(function(item){
            str+= `<tr>
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

// 加入購物車幫監聽
productList.addEventListener('click',function(e){
    e.preventDefault();
    let addCardClass=e.target.getAttribute('class');
    if(addCardClass !== 'addCardBtn'){
        return;
    }
    let productId=e.target.get('data-id');
    let checkNum=1;
    cartData.forEach(function(item){
        if(item.product.id===productId){
            checkNum=item.quantity+=1;
        }
    })
    axios.post("https://livejs-api.hexschool.io/api/livejs/v1/customer/jocelyn3/carts",{
        data:{
            "productId":productId,
            "quantity":checkNum
        }
    }).then (function(response){
        alert('加入成功')
        getCartList()
    })
})

//刪除邏輯
cartList.addEventListener('click',function(e){
    e.preventDefault();
    const cartId=e.target.getAttribute('data-id');
    if(cartId===null){
        console.log('wrong place');
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/jocelyn3/carts/{cartId}`).then(function(response){
        alert('刪除成功');
        getCartList();
    })
})

// 刪除全部
const discardAllBtn=document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete("https://livejs-api.hexschool.io/api/livejs/v1/customer/jocelyn3/carts").then(function(response){
        alert('刪除全部啦~')
        getCartList()
    }).catch(function(response){
        alert('購物車已清空')
    })
})

//送出訂單
const orderInfoBtn=document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    if(cartData.length===0){
        alert('購物車沒有東西')
        return;
    }
    const orderInfoForm=document.querySelector('.orderInfo-form');
    const customerName=document.querySelector('#customerName').value;
    const customerPhone=document.querySelector('#customerPhone').value;
    const customerEmail=document.querySelector('#customerEmail').value;
    const customerAddress=document.querySelector('#customerAddress').value;
    const tradeWay=document.querySelector('#tradeWay').value;
    if (customerName==="" || customerPhone==="" || customerEmail==="" || customerAddress==="" || tradeWay===""){
        alert('訂單資訊有缺少')
        return
      }
    axios.post("https://livejs-api.hexschool.io/api/livejs/v1/customer/jocelyn3/orders",{
        "data":{
            "user": {
                "name": customerName,
                "tel": customerPhone,
                "email": customerEmail,
                "address": customerAddress,
                "payment": tradeWay
              }
        }}).then(function(response){
            alert('訂單已送出');
            getCartList();
            orderInfoForm.reset();
        })
})
