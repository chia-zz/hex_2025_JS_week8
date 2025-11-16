let orderData = [];
const orderList = document.querySelector(".order-list");

function init() {
  getOrderList();
}
init();

function renderC3() {
  console.log(orderData);

  // 物件資料搜集
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] === undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      }
    });
  });
  console.log(total);

  // 輸出資料關聯
  let categoryAry = Object.keys(total);
  let newData = [];
  categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  console.log(newData);

  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      colors: {
        床架: "#DACBFF",
        窗簾: "#9D7FEA",
        收納: "#5434A7",
        其他: "#301E5F",
      },
    },
  });
}

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

      let str = "";
      orderData.forEach(function (item) {
        // 組訂單字串
        let productItemStr = "";
        item.products.forEach(function (productItem) {
          productItemStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });
        // 組時間日期字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}`;
        // 判斷訂單處理狀態
        let orderStatus = "";
        if (item.paid === true) {
          orderStatus = "已處理";
        } else if (item.paid === false) {
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
              <td>${orderTime}</td>
              <td class="orderStatus">
                <a href="#" data-status="${item.paid}" data-id="${item.id}" style="color:#0067ce;"><span data-status="${item.paid}" class="orderStatusLink" data-id="${item.id}">${orderStatus}</span></a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn orderDelete" data-id="${item.id}" value="刪除" />
              </td>
            </tr>`;
      });
      orderList.innerHTML = str;
      renderC3();
    });
}

// 未處理、刪除按鈕等功能
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");

  if (targetClass == "delSingleOrder-Btn orderDelete") {
    deleteOrderItem(id);
    return;
  }
  if (targetClass == "orderStatusLink") {
    let status = e.target.getAttribute("data-status");
    updateOrderStatus(status, id);
    return;
  }
});

// 刪除訂單功能
function deleteOrderItem(id) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("訂單刪除成功！");
      getOrderList();
    });
}

// 修改訂單狀態功能
function updateOrderStatus(status, id) {
  console.log(status, id);
  let newStatus;
  if (status === true) {
    newStatus = false;
  } else if (status !== true) {
    newStatus = true;
  }
  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("修改訂單狀態成功！");
      getOrderList();
    });
}

// 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("全部訂單刪除成功！");
      getOrderList();
    });
});
