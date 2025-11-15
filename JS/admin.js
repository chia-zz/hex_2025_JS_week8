let orderData = [];
const orderList = document.querySelector(".order-list");

function init() {
  getOrderList();
}
init();

// 獲取、渲染訂單資料
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      orderData = response.data.orders;
      console.log(orderData);

      let str = "";
      orderData.forEach(function (item) {
        // 組訂單字串
        let productItemStr = "";
        item.products.forEach(function (productItem) {
          productItemStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });
        // 判斷訂單處理狀態
        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "已處理";
        } else {
          orderStatus = "未處理";
        }

        str += `<tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                ${productItemStr}
              </td>
              <td>${item.createdAt}</td>
              <td class="orderStatus">
                <a href="#" class="orderStatusLink" data-id="${item.id}">${orderStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn orderDelete" data-id="${item.id}" value="刪除" />
              </td>
            </tr>`;
      });
      orderList.innerHTML = str;
    });
}

// 未處理、刪除按鈕等功能
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  console.log(targetClass);
});
