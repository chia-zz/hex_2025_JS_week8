const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableBody");
let productData = [];
let cartData = [];

// 設定初始化
function init() {
  getProductList();
  getCartList();
}
init();

function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      productData = response.data.products;
      renderProductList();
    })
    .catch(function (error) {
      showToast("發生錯誤，請稍後再試", "error");
    });
}

// 設定函式，優化常用、重複內容
function assembleProductCard(item) {
  return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <div class="image-container"> 
            <img
              src=${item.images}
              alt="${item.title}"
            />
          </div>
          <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
          <p class="nowPrice">NT$${toThousands(item.price)}</p>
        </li>`;
}

function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += assembleProductCard(item);
  });
  productList.innerHTML = str;
}

// 設定篩選區
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return;
  }
  let str = "";
  productData.forEach(function (item) {
    if (category === item.category) {
      str += assembleProductCard(item);
    }
  });
  productList.innerHTML = str;
});

// 設定加入購物車按鈕
productList.addEventListener("click", function (e) {
  e.preventDefault(); // 阻止預設行為
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "addCardBtn") {
    return;
  }
  let productId = e.target.getAttribute("data-id");

  // 點擊按鈕、加入購物車流程
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });
  // console.log(numCheck); 檢查用

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: numCheck,
        },
      }
    )
    .then(function (response) {
      showToast("加入購物車！", "success");
      getCartList();
    })
    .catch(function (error) {
      showToast("發生錯誤，請稍後再試", "error");
    });
});

// 設定購物車渲染效果
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      cartData = response.data.carts;
      // 處理總金額
      const finalTotal = document.querySelector(".final-total");
      finalTotal.textContent = toThousands(response.data.finalTotal);

      let str = "";
      // 如果購物車沒有東西
      if (cartData.length === 0) {
        str = `<tr><td colspan="5" style="text-align: center;"><h2>目前購物車是空的喔！</h2></td></tr>`;
      } else {
        cartData.forEach(function (item) {
          str += `<tr>
              <td>
                <div class="cardItem-title">
                  <img
                    src=${item.product.images}
                    alt=${item.product.title}
                  />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${toThousands(item.product.price)}</td>
              <td>
                <div class="item-quantity">
                  <input type="button" class="minusBtn" data-id="${
                    item.id
                  }" data-quantity="${item.quantity}" value="-"> 
                  <span>${item.quantity}</span> 
                  <input type="button" class="plusBtn" data-id="${
                    item.id
                  }" data-quantity="${item.quantity}" value="+">
                </div>
              </td>
              <td>NT$${toThousands(item.product.price * item.quantity)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons delete-single-btn" data-id="${
                  item.id
                }"> clear </a>
              </td>
            </tr>`;
        });
      }
      cartList.innerHTML = str;
    })
    .catch(function (error) {
      showToast("發生錯誤，請稍後再試", "error");
    });
}

// 處理購物車內容功能
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId === null) {
    return;
  }
  console.log(cartId);

  // 刪除單筆邏輯
  if (e.target.classList.contains("delete-single-btn")) {
    axios
      .delete(
        `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
      )
      .then(function (response) {
        showToast("刪除單筆購物車成功！", "success");
        getCartList();
      })
      .catch(function (error) {
        showToast("發生錯誤，請稍後再試", "error");
      });
  }
  // 減少數量邏輯+如果購物車數量被減為0就刪除該筆項目
  else if (e.target.classList.contains("minusBtn")) {
    const currentQuantity = parseInt(e.target.getAttribute("data-quantity"));
    const newQuantity = currentQuantity - 1;
    if (newQuantity > 0) {
      axios
        .patch(
          `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
          { data: { id: cartId, quantity: newQuantity } }
        )
        .then(function (response) {
          showToast("減少數量成功", "decrease");
          getCartList();
        })
        .catch(function (error) {
          showToast("發生錯誤，請稍後再試", "error");
        });
    } else if (newQuantity === 0) {
      axios
        .delete(
          `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
        )
        .then(function (response) {
          showToast("商品已從購物車移除！", "remove");
          getCartList();
        })
        .catch(function (error) {
          showToast("發生錯誤，請稍後再試", "error");
        });
    }
  }
  // 增加數量邏輯
  else if (e.target.classList.contains("plusBtn")) {
    const currentQuantity = parseInt(e.target.getAttribute("data-quantity"));
    const newQuantity = currentQuantity + 1;
    axios
      .patch(
        `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
        { data: { id: cartId, quantity: newQuantity } }
      )
      .then(function (response) {
        showToast("增加數量成功", "increase");
        getCartList();
      })
      .catch(function (error) {
        showToast("發生錯誤，請稍後再試", "error");
      });
  }
});

// 刪除購物車全部品項流程
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      showToast("刪除全部購物車成功！", "success");
      getCartList();
    })
    .catch(function (response) {
      showToast("已經沒有東西可刪除了！", "warning");
    });
});

// 送出訂單區
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const orderInfoMessage = document.querySelectorAll(".orderInfo-message");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length === 0) {
    showToast("請先加入商品到購物車！", "warning");
    return;
  }
  const customerName = document.querySelector("#customerName");
  const customerPhone = document.querySelector("#customerPhone");
  const customerEmail = document.querySelector("#customerEmail");
  const customerAddress = document.querySelector("#customerAddress");
  const tradeWay = document.querySelector("#tradeWay");
  const formInputs = [
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    tradeWay,
  ];
  // 整體驗證
  orderInfoMessage.forEach((item) => {
    item.innerHTML = "";
  });
  let isFormValid = true; // 驗證是否為空
  formInputs.forEach((item, index) => {
    if (!orderInfoMessage[index]) return;
    const value = item.value;
    if (value.trim() === "") {
      orderInfoMessage[index].innerHTML = `
                <p style="color: #dc3545;">此欄必填！</p>
            `;
      isFormValid = false;
    } else if (value === "請選擇付款方式") {
      orderInfoMessage[index].innerHTML = `
                <p style="color: #dc3545;">此欄必選！</p>
            `;
      isFormValid = false;
    }
  });
  if (!isFormValid) {
    return;
  }

  // 單一欄位驗證
  if (emailIsValid(customerEmail.value) === false) {
    showToast("請填寫正確的Email格式！", "error");
    return;
  }
  if (telIsValid(customerPhone.value) === false) {
    showToast("請填寫正確的電話號碼！", "error");
    return;
  }

  // 製作訂單格式
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName.value,
            tel: customerPhone.value,
            email: customerEmail.value,
            address: customerAddress.value,
            payment: tradeWay.value,
          },
        },
      }
    )
    .then(function (response) {
      showToast("訂單建立成功！", "success");
      const orderInfoForm = document.querySelector(".orderInfo-form");
      orderInfoForm.reset();
      getCartList();
    })
    .catch(function (error) {
      showToast("訂單建立失敗，請稍後再試", "error");
    });
});
// 雙重驗證email
const customerEmail = document.querySelector("#customerEmail");
customerEmail.addEventListener("blur", function (e) {
  if (emailIsValid(customerEmail.value) === false) {
    showToast("請填寫正確的Email格式！", "error");
    return;
  }
});
// 雙重驗證電話
const customerPhone = document.querySelector("#customerPhone");
customerPhone.addEventListener("blur", function (e) {
  if (telIsValid(customerPhone.value) === false) {
    showToast("請填寫正確的電話號碼！", "error");
    return;
  }
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
  increase: {
    style: {
      color: "#f8f9fa",
      background: "#8540f5",
    },
  },
  decrease: {
    style: {
      color: "#f8f9fa",
      background: "#432874",
    },
  },
  remove: {
    style: {
      color: "#f8f9fa",
      background: "#c53030",
    },
  },
};
function showToast(message, type = "error") {
  Toastify({
    text: message,
    className: "info",
    style: toastifyStyle[type].style,
  }).showToast();
}

// util js
// 處理千分位
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
// 驗證email格式
function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// 驗證電話號碼
function telIsValid(phone) {
  const telTest = /^\d{10}$/;
  return telTest.test(phone);
}
