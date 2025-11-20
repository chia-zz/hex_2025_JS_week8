let orderData = [];
const orderList = document.querySelector(".order-list");

function init() {
  getOrderList();
}
init();

function renderC3() {
  // 類別營收資料
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      const revenue = productItem.price * productItem.quantity;
      if (total[productItem.category] === undefined) {
        total[productItem.category] = revenue;
      } else {
        total[productItem.category] += revenue;
      }
    });
  });

  // 輸出資料關聯
  let newData = Object.entries(total);
  // let categoryAry = Object.keys(total);
  // let newData = [];
  // categoryAry.forEach(function (item) {
  //   let ary = [];
  //   ary.push(item);
  //   ary.push(total[item]);
  //   newData.push(ary);
  // });

  // 物件資料蒐集
  let obj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.quantity * productItem.price;
      } else {
        obj[productItem.title] += productItem.quantity * productItem.price;
      }
    });
  });

  // 拉出資料屬性、整理成C3格式
  let rankSortAry = Object.entries(obj);
  // let originAry = Object.keys(obj);
  // let rankSortAry = [];
  // originAry.forEach(function (item) {
  //   let ary = [];
  //   ary.push(item);
  //   ary.push(obj[item]);
  //   rankSortAry.push(ary);
  // });

  // 用sort比大小做出營收排序
  rankSortAry.sort(function (a, b) {
    return b[1] - a[1];
  });

  // 營收項目超過4筆後就統整到其他項目裡
  if (rankSortAry.length > 3) {
    let otherTotal = 0;
    rankSortAry.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += rankSortAry[index][1];
      }
    });
    rankSortAry.splice(3, rankSortAry.length - 1);
    rankSortAry.push(["其他", otherTotal]);
  }

  // C3.js
  let category = c3.generate({
    bindto: "#category-chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
  let rankChart = c3.generate({
    bindto: "#rank-chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: rankSortAry,
    },
    color: {
      pattern: ["#042B58", "#016191", "#0ea0d0", "#7cb0d3"],
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
      orderData = response.data.orders.sort(function (a, b) {
        // 訂單時間順序
        if (sortOrder === "newest") {
          return b.createdAt - a.createdAt;
        } else {
          return a.createdAt - b.createdAt;
        }
      });

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
    })
    .catch(function (error) {
      showToast("發生錯誤，請稍後再試", "error");
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
      showToast("訂單刪除成功！");
      getOrderList();
    })
    .catch(function (error) {
      showToast("發生錯誤，請稍後再試", "error");
    });
}

// 修改訂單狀態功能
function updateOrderStatus(status, id) {
  // console.log(status, id); 檢查用
  let newStatus;
  if (status === "true") {
    newStatus = false;
  } else {
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
      showToast("修改訂單狀態成功！");
      getOrderList();
    })
    .catch(function (error) {
      showToast("發生錯誤，請稍後再試", "error");
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
      showToast("全部訂單刪除成功！");
      getOrderList();
    })
    .catch(function (error) {
      showToast("發生錯誤，請稍後再試", "error");
    });
});

// 訂單時間排序
const sortOrderSelect = document.querySelector("#sortOrder");
let sortOrder = "newest";
sortOrderSelect.addEventListener("change", function (e) {
  sortOrder = e.target.value;
  getOrderList();
});

// toastify style設定
const toastifyStyle = {
  error: {
    style: {
      color: "#dc3545",
      background: "#f8d7da",
      border: "1px solid #dc3545",
    },
  },
  success: {
    style: {
      color: "#198754",
      background: "#d1e7dd",
      border: "1px solid #198754",
    },
  },
  warning: {
    style: {
      color: "#ffc107",
      background: "#fff3cd",
      border: "1px solid #ffc107",
    },
  },
};
function showToast(message, type = "success") {
  Toastify({
    text: message,
    className: "info",
    style: toastifyStyle[type].style,
  }).showToast();
}
