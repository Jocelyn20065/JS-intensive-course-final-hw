

function init(){
    getAdminOrderList()
}
init();
// 取得後臺資料

const orderList=document.querySelector('.js-orderlist');
let adminOrderData=[];

//  c3Chart
function c3Chart(){
    // console.log(adminOrderData);
    //物件資料蒐集
    let total={};
    adminOrderData.forEach(function(item){
        item.products.forEach(function(productItem){
            // console.log(productItem);
            if(total[productItem.category]===undefined){
                total[productItem.category]=productItem.price*productItem.quantity;
            }
        })
    })
    // console.log(total);
    // 整理成c3要得格式
    let c3Obj=Object.keys(total);
    // console.log(c3Obj);
    let newAry=[];
    c3Obj.forEach(function(item){
        let itemAry=[];
        itemAry.push(item);
        itemAry.push(total[item]);
        newAry.push(itemAry)
    })
    // console.log(newAry)
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns:newAry,
        },
    });
}
 


//c3_lv2
function c3Lv2(){
    //物件蒐集
    let total={};
    adminOrderData.forEach(function(item){
        // console.log(item)
        item.products.forEach(function(productItem){
            // console.log(productItem);
            if(total[productItem.title]===undefined){
                total[productItem.title]=productItem.price*productItem.quantity;
            }
        })
    })
    //整理c3格式
    let c3Lv2ary=Object.keys(total);
    // console.log(total)
    let newAry=[];
    c3Lv2ary.forEach(function(item){
        let itemAry=[];
        itemAry.push(item);
        itemAry.push(total[item]);
        // console.log(itemAry);
        newAry.push(itemAry);
    })
    // console.log(newAry)
    // sort 陣列排序
    newAry.sort(function(a,b){
        return b[1]-a[1];
    })
    console.log(newAry);
    if(newAry.length>3){
        let otherTotal=0;
        newAry.forEach(function(item,index){
            if(index>2){
                otherTotal+=newAry[index][1];
            }
        })
        // console.log(otherTotal)
        newAry.splice(3,newAry.length-3);
        // console.log(newAry)
        newAry.push(['其他', otherTotal])
        console.log(newAry)
    }
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns:newAry,
        },
    });

}


function getAdminOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            authorization: token,
        }
    }).then(function (response){
        // console.log(response.data.orders)
        adminOrderData=response.data.orders;
        // console.log(adminOrderData)
        let str="";
        adminOrderData.forEach(function(item){
            //修改時間戳
            const timestamp=new Date(item.createdAt*1000);
            const orderTime=`${timestamp.getFullYear()}/${timestamp.getMonth()+1}/${timestamp.getDate()}`;
            // console.log(orderTime)
            // 修改paid狀態
            let paidStatus="";
            if(item.paid===true){
                paidStatus="已處理"
            }else{
                paidStatus="未處理"
            }
            // 修改物品名稱及數量
            let productStr="";
            item.products.forEach(function(productsItem){
                productStr+=`<p>${productsItem.title} x ${productsItem.quantity}</p> `
            })
            str+=` <tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              ${productStr}
            </td>
            <td>${orderTime}</td>
            <td >
              <a class="orderStatus" data-status="${item.paid}"  data-id="${item.id}" href="#">${paidStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" data-status="${item.paid}" data-id="${item.id}"value="刪除">
            </td>
        </tr>`
        })
        orderList.innerHTML=str;
        c3Lv2();
        // c3Chart();
    })
}

// 刪除訂單& 修改訂單狀態

const orderTable=document.querySelector('.orderPage-table');

// console.log(orderTable);
orderTable.addEventListener('click',function(e){
    e.preventDefault();
    let status=e.target.getAttribute('data-status')
    let orderId=e.target.getAttribute('data-id')
    const targetClass=e.target.getAttribute('class');
    //修改訂單狀態
    if(targetClass==="orderStatus"){
        changeOrderItem(status,orderId);
        return;
    }
    if(targetClass==="delSingleOrder-Btn"){
        console.log(status)
        // if(status==="false"){
        //     alert('這筆訂單尚未完成，無法刪除');
        //     return;
        // }
        // console.log(orderId)
        deleteOrderItem(orderId);
        return;
    }


})


function changeOrderItem(status,orderId){
    // console.log(status,orderId)
    let newStatus;
    if(status=="false"){
        newStatus=true;
    }else{
        newStatus=false;
    }
    // console.log(newStatus);
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
          "id":orderId,
          "paid": newStatus,
        }
      },{
        headers:{
            authorization: token,
        }
    }).then(function(response){
        alert('訂單狀態已更改');
        getAdminOrderList();
    })
    

}
function deleteOrderItem(orderId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,{
        headers:{
            authorization: token,
        }
    }).then(function(response){
        alert('刪除訂單成功');
        getAdminOrderList();
    })
}
//刪除全部訂單
const discardAllBtn=document.querySelector('.discardAllBtn');
console.log(discardAllBtn)

discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,{
        headers:{
            authorization: token,
        }
    }).then(function(response){
        alert('刪除全部訂單成功');
        getAdminOrderList();
    })
})