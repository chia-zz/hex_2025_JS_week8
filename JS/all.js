console.log(api_path, token);

const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
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
          <del class="originPrice">NT$${item.origin_price}</del>
          <p class="nowPrice">NT$${item.price}</p>
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
});

// 設定購物車渲染效果
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      cartData = response.data.carts;
      let str = "";
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
              <td>NT$${item.product.price}</td>
              <td>${item.quantity}</td>
              <td>NT$${item.product.price * item.quantity}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons"> clear </a>
              </td>
            </tr>`;
      });
      const cartList = document.querySelector(".shoppingCart-tableBody");
      cartList.innerHTML = str;
    });
}
