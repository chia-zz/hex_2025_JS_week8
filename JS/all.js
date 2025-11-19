console.log(api_path, token);

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
          <img
            src=${item.images}
            alt="${item.title}"
          />
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
  console.log(productId);

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
              <td><input type="button" class="minusBtn" value="-"> <span>${
                item.quantity
              }</span> <input type="button" class="plusBtn" value="+"></td>
              <td>NT$${toThousands(item.product.price * item.quantity)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${
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

// 刪除購物車內容功能
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  }
  console.log(cartId);
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
});

// 刪除購物車全部品項流程
const discardBtn = document.querySelector(".discardAllBtn");
discardBtn.addEventListener("click", function (e) {
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
const orderInfoMessage = document.querySelector(".orderInfo-message");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length === 0) {
    showToast("請先加入商品到購物車！", "warning");
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  console.log(
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    tradeWay
  );
  if (
    customerName === "" ||
    customerPhone === "" ||
    customerEmail === "" ||
    customerAddress === "" ||
    tradeWay === ""
  ) {
    showToast("請輸入訂單資訊！", "error");
    return;
  }
  if (emailIsValid(customerEmail) === false) {
    showToast("請填寫正確的Email格式", "error");
    return;
  }
  // 製作訂單格式
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay,
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
// 驗證電話
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
      color: "#e96868",
      background: "#eeecec",
      border: "1px solid #e96868",
    },
  },
  success: {
    style: {
      color: "#28a745",
      background: "#eeecec",
      border: "1px solid #28a745",
    },
  },
  warning: {
    style: {
      color: "#ff9c07",
      background: "#eeecec",
      border: "1px solid #ff9c07",
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
// 數量增減按鈕
function minus() {}
const minusBtn = document.querySelector(".minusBtn");
minusBtn.addEventListener("click", function (e) {
  console.log(e.target);
});
// 驗證email格式
function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// 驗證電話號碼
function telIsValid(phone) {
  const telTest = /^\d{10}$/;
  return telTest.test(phone);
}
